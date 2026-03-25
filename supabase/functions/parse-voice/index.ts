/**
 * parse-voice Edge Function
 *
 * Receives an audio recording (or transcribed text), processes it through
 * Gemini 2.5 Flash-Lite (native multimodal), and returns structured
 * transaction data with category assignments.
 *
 * Supports Arabic (MSA + Egyptian dialect), English, and code-switching.
 *
 * Architecture & Design Rationale:
 * - Pattern: Gateway + Retry (exponential backoff)
 * - Why: Gemini rate limits cause 429/500 errors under load.
 *   Retry with backoff absorbs transient failures without pushing
 *   complexity to the mobile client.
 * - SOLID: SRP — only handles AI interaction, no DB access.
 *
 * @module parse-voice
 */

import "edge-runtime";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Maximum audio size in bytes (~1 minute of compressed audio). */
const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Max retries for Gemini API calls. */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms). Retries: 2s, 4s, 8s. */
const BASE_RETRY_DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// Category tree — mirrors parse-sms L1/L2 hierarchy.
// Used as fallback when client doesn't provide one.
// ---------------------------------------------------------------------------

const DEFAULT_CATEGORY_TREE = `
EXPENSE categories (return the system_name value):
  L1: food_drinks
    L2: groceries, restaurant, coffee_tea, snacks, drinks, food_other
  L1: transportation
    L2: public_transport, private_transport, transport_other
  L1: vehicle
    L2: fuel, parking, rental, license_fees, vehicle_tax, traffic_fine, vehicle_buy, vehicle_sell, vehicle_maintenance, vehicle_other
  L1: shopping
    L2: clothes, electronics_appliances, accessories, footwear, bags, kids_baby, beauty, home_garden, pets, sports_fitness, toys_games, wedding, detergents, decorations, personal_care, shopping_other
  L1: health_medical
    L2: doctor, medicine, surgery, dental, health_other
  L1: utilities_bills
    L2: electricity, water, internet, phone, gas, trash, online_subscription, streaming, taxes, utilities_other
  L1: entertainment
    L2: events, tickets, trips_holidays, entertainment_other
  L1: charity
    L2: donations, fundraising, charity_gifts, charity_other
  L1: education
    L2: books, tuition, education_fees, education_other
  L1: housing
    L2: rent, housing_maintenance, housing_tax, housing_buy, housing_sell, housing_other
  L1: travel
    L2: vacation, business_travel, holiday, travel_other
  L1: debt_loans
    L2: lent_money, debt_repayment_paid, debt_other
  L1: asset_purchase
  L1: other
    L2: uncategorized

INCOME categories:
  L1: income
    L2: salary, bonus, commission, refund, loan_income, gift_income, check, rental_income, freelance, business_income, income_other
  L1: asset_sale
  L1: debt_loans
    L2: borrowed_money, debt_repayment_received
`;

// ---------------------------------------------------------------------------
// Gemini response JSON schema
// ---------------------------------------------------------------------------

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    transcript: {
      type: "string",
      description:
        "Full text interpretation of the user's voice recording. Translate Arabic to English.",
    },
    transactions: {
      type: "array",
      description: "Array of extracted transactions from the voice input.",
      items: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Transaction amount as a positive number.",
          },
          type: {
            type: "string",
            description:
              "Transaction type: EXPENSE for spending, INCOME for receiving money.",
            enum: ["EXPENSE", "INCOME"],
          },
          counterparty: {
            type: "string",
            description:
              "The counterparty name (merchant, vendor, person, or entity). Translate to English if originally in Arabic. Return empty string if not mentioned.",
          },
          categorySystemName: {
            type: "string",
            description:
              "Exactly ONE system_name from the category tree. Use a specific L2 ONLY when confident. If uncertain about which L2 fits, use the L1 parent instead. NEVER use *_other L2 categories — use the L1 parent. Fall back to 'other' only as last resort.",
          },
          description: {
            type: "string",
            description:
              "Short description of the transaction. Translate to English if originally in Arabic.",
          },
          accountId: {
            type: "string",
            description:
              "The matched account ID from the provided account list. Return empty string if no account was mentioned or no match found.",
          },
          date: {
            type: "string",
            description:
              "ISO 8601 date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) if the user mentioned a date or time (e.g., 'yesterday', 'last Friday'). Return empty string if no date/time was mentioned.",
          },
          confidenceScore: {
            type: "number",
            description:
              "Your confidence in the accuracy of this extraction (0.0 to 1.0). 1.0 = all fields are perfectly clear. 0.5 = some fields required guessing.",
          },
        },
        required: [
          "amount",
          "type",
          "counterparty",
          "categorySystemName",
          "description",
          "accountId",
          "date",
          "confidenceScore",
        ],
      },
    },
  },
  required: ["transcript", "transactions"],
};

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

interface AccountInfo {
  readonly id: string;
  readonly name: string;
}

function buildSystemPrompt(
  categoryTree: string,
  accounts: readonly AccountInfo[]
): string {
  const accountSection =
    accounts.length > 0
      ? `
ACCOUNT MATCHING:
The user has the following accounts:
${accounts.map((a) => `  - Name: "${a.name}" → ID: "${a.id}"`).join("\n")}

If the user mentions an account by name (e.g., "from my CIB account"), match it to the closest account name above and return the corresponding ID in the accountId field.
If no account is mentioned or no match found, return an empty string for accountId.
`
      : `
ACCOUNT MATCHING:
No accounts provided. Always return empty string for accountId.
`;

  return `You are Astik AI, a voice-to-transaction parser for an Egyptian personal finance app.

YOUR TASK:
Listen to the user's voice input (or read their transcribed text) and extract financial transactions.
The user might speak in English, Arabic (MSA or Egyptian dialect), a mix, or Franco-Arab.

Also provide a full text transcript of what the user said, translated to English.

PARSING RULES:
1. A user may describe one or more transactions in a single recording.
2. Amount: Extract numerical amounts. Handle spoken numbers in Arabic or English.
3. Type: EXPENSE for spending (bought, paid, etc.), INCOME for receiving (salary, gift, received, etc.).
4. Counterparty: The entity or person involved. Translate Arabic names to English where reasonable. If the user does NOT mention a merchant or counterparty, return an empty string "".
5. Category: return EXACTLY ONE system_name from the CATEGORY TREE below.
   You MUST NOT invent, combine, or modify category names.
   Valid values are ONLY the exact strings listed in the tree.
   Use a specific L2 when confident (e.g. groceries, restaurant).
   If uncertain which L2 fits, use the L1 parent (e.g. food_drinks, shopping).
   NEVER use *_other L2 categories (food_other, shopping_other, etc.) — always prefer the L1 parent.
   Only use 'other' as an absolute last resort.
6. Description: A brief English summary of the transaction.
7. Date: If the user mentions a date or time reference (e.g., "yesterday", "last Friday", "two days ago"), calculate the actual date based on today's date and return it in ISO 8601 format. If no date is mentioned, return an empty string.
8. confidenceScore: your confidence in the accuracy of this extraction (0.0 to 1.0).

${accountSection}

EXAMPLES:
- "اشتريت قهوة من ستاربكس بـ ٨٠ جنيه" → { amount: 80, type: "EXPENSE", counterparty: "Starbucks", categorySystemName: "coffee_tea", description: "Coffee from Starbucks", accountId: "", date: "", confidenceScore: 0.95 }
- "Paid 200 pounds for Uber" → { amount: 200, type: "EXPENSE", counterparty: "Uber", categorySystemName: "private_transport", description: "Uber ride", accountId: "", date: "", confidenceScore: 0.9 }
- "I received my salary, 15000" → { amount: 15000, type: "INCOME", counterparty: "Employer", categorySystemName: "salary", description: "Monthly salary", accountId: "", date: "", confidenceScore: 0.85 }
- "yesterday I spent 50 on groceries" → { amount: 50, type: "EXPENSE", counterparty: "", categorySystemName: "groceries", description: "Groceries", accountId: "", date: "<yesterday's date>", confidenceScore: 0.9 }

CATEGORY TREE:
${categoryTree}

IMPORTANT:
- Return ONLY valid transactions. If the audio is unclear or non-financial, return an empty transactions array.
- Multiple transactions in one recording should each be a separate item in the array.
- Always provide a transcript even if no transactions are found.
`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoiceTransaction {
  readonly amount: number;
  readonly type: string;
  readonly counterparty: string;
  readonly categorySystemName: string;
  readonly description: string;
  readonly accountId: string;
  readonly date: string;
  readonly confidenceScore: number;
}

interface AiResponse {
  readonly transcript: string;
  readonly transactions: ReadonlyArray<VoiceTransaction>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, code: status }, status);
}

/**
 * Verify the JWT from the Authorization header.
 */
async function verifyAuth(
  authHeader: string | null
): Promise<{ userId: string } | null> {
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return { userId: data.user.id };
}

/**
 * Detect audio MIME type from the first bytes of the file.
 */
function detectAudioMimeType(bytes: Uint8Array): string {
  // Check for common audio file signatures
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return "audio/mpeg";
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67)
    return "audio/ogg";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  )
    return "audio/wav";
  // M4A/AAC: check for ftyp box (ISO base media file format)
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  )
    return "audio/mp4";
  // Default to webm for most mobile recordings
  return "audio/webm";
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process audio/text through Gemini with retry and exponential backoff.
 * Retries up to MAX_RETRIES times on failure (2s → 4s → 8s delays).
 */
async function processWithRetry(
  ai: GoogleGenAI,
  contents: ContentListUnion,
  systemPrompt: string
): Promise<AiResponse> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(
          `[parse-voice] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms`
        );
        await sleep(delay);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          temperature: 0,
        },
      });

      const text = response.text ?? "";
      if (!text) return { transcript: "", transactions: [] };

      const parsed: AiResponse = JSON.parse(text);
      return {
        transcript: parsed.transcript ?? "",
        transactions: parsed.transactions ?? [],
      };
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[parse-voice] Attempt ${attempt + 1} failed: ${errMsg}`);

      // Don't retry on non-retryable errors (auth, bad request)
      if (
        errMsg.includes("401") ||
        errMsg.includes("403") ||
        errMsg.includes("INVALID")
      ) {
        break;
      }
    }
  }

  // All retries exhausted
  const finalMsg =
    lastError instanceof Error ? lastError.message : "Unknown error";
  console.error(`[parse-voice] All retries exhausted: ${finalMsg}`);
  return { transcript: "", transactions: [] };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // 1. Auth
    const auth = await verifyAuth(req.headers.get("authorization"));
    if (!auth) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Parse input — supports both multipart form data and JSON (text query)
    const contentType = req.headers.get("content-type") ?? "";
    let audioBytes: Uint8Array | null = null;
    let textQuery: string | null = null;
    let languageHint: string | null = null;
    let categoriesInput: string | null = null;
    let accountsInput: AccountInfo[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio");
      languageHint = formData.get("language") as string | null;
      categoriesInput = formData.get("categories") as string | null;

      // Parse accounts from form data
      const accountsRaw = formData.get("accounts") as string | null;
      if (accountsRaw) {
        try {
          const parsed = JSON.parse(accountsRaw);
          if (Array.isArray(parsed)) {
            accountsInput = parsed.filter(
              (a: unknown): a is AccountInfo =>
                typeof a === "object" &&
                a !== null &&
                typeof (a as AccountInfo).id === "string" &&
                typeof (a as AccountInfo).name === "string"
            );
          }
        } catch {
          console.warn("[parse-voice] Failed to parse accounts JSON");
        }
      }

      if (audioFile instanceof File) {
        if (audioFile.size === 0) {
          return errorResponse("Audio file is empty.", 400);
        }
        if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
          return errorResponse(
            `Audio file too large. Maximum size is ${MAX_AUDIO_SIZE_BYTES / 1024 / 1024} MB.`,
            413
          );
        }
        const buffer = await audioFile.arrayBuffer();
        audioBytes = new Uint8Array(buffer);
      }
    } else if (contentType.includes("application/json")) {
      // Fallback: accept a text transcription for testing / future use
      let body: {
        query?: unknown;
        language?: unknown;
        categories?: unknown;
        accounts?: unknown;
      };
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body.", 400);
      }

      if (typeof body.query !== "string" || body.query.trim().length === 0) {
        return errorResponse("`query` must be a non-empty string.", 400);
      }
      textQuery = body.query.trim();
      languageHint = typeof body.language === "string" ? body.language : null;
      categoriesInput =
        typeof body.categories === "string" ? body.categories : null;

      if (Array.isArray(body.accounts)) {
        accountsInput = (body.accounts as unknown[]).filter(
          (a: unknown): a is AccountInfo =>
            typeof a === "object" &&
            a !== null &&
            typeof (a as AccountInfo).id === "string" &&
            typeof (a as AccountInfo).name === "string"
        );
      }
    }

    if (!audioBytes && !textQuery) {
      return errorResponse(
        "Either an 'audio' file (multipart) or a 'query' string (JSON) is required."
      );
    }

    // 3. Init Gemini
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return errorResponse("GEMINI_API_KEY not configured", 500);
    }
    const ai = new GoogleGenAI({ apiKey });

    // 4. Build system prompt with dynamic category tree and accounts
    const categoryTree = categoriesInput ?? DEFAULT_CATEGORY_TREE;
    const systemPrompt = buildSystemPrompt(categoryTree, accountsInput);

    // 5. Build content parts
    let contents: ContentListUnion;

    if (audioBytes) {
      // Multimodal: audio + text prompt
      const mimeType = detectAudioMimeType(audioBytes);
      // Encode in chunks to avoid call-stack limits on large buffers
      const CHUNK_SIZE = 8192;
      let binaryString = "";
      for (let i = 0; i < audioBytes.length; i += CHUNK_SIZE) {
        const chunk = audioBytes.subarray(i, i + CHUNK_SIZE);
        binaryString += String.fromCharCode(...chunk);
      }
      const base64Audio = btoa(binaryString);

      contents = [
        {
          inlineData: {
            mimeType,
            data: base64Audio,
          },
        },
        {
          text: `Parse the financial transactions from this voice recording.${
            languageHint ? ` Language hint: ${languageHint}.` : ""
          } Today's date is ${new Date().toISOString().split("T")[0]}.`,
        },
      ];
    } else {
      // Text-only mode (transcription or test)
      contents = `Parse this voice command into transactions: "${textQuery}".${
        languageHint ? ` Language: ${languageHint}.` : ""
      } Today's date is ${new Date().toISOString().split("T")[0]}.`;
    }

    // 6. Call Gemini with retry
    const result = await processWithRetry(ai, contents, systemPrompt);

    console.log(
      `[parse-voice] Parsed ${result.transactions.length} transactions`
    );

    // 7. Return results (no currency — set client-side)
    return jsonResponse({
      transcript: result.transcript,
      transactions: result.transactions,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[parse-voice] Error:", message);
    return errorResponse("Internal server error", 500);
  }
});
