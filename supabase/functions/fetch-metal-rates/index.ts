import "edge-runtime";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MetalsApiResponse {
  status: string;
  currency: string;
  unit: string;
  metals: {
    gold: number;
    silver: number;
    platinum?: number;
    palladium?: number;
  };
  currencies: Record<string, number>;
  timestamps: {
    metal: string;
    currency: string;
  };
}

interface MarketRatesRow {
  id: number;
  gold_egp_per_gram: number;
  silver_egp_per_gram: number;
  usd_egp: number;
  eur_egp: number;
  timestamp: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the metals.dev API key from environment
    const metalsApiKey = Deno.env.get("METALS.DEV_API_KEY");
    if (!metalsApiKey) {
      throw new Error("METALS.DEV_API_KEY is not configured");
    }

    // Fetch from metals.dev API
    const apiUrl = `https://api.metals.dev/v1/latest?api_key=${metalsApiKey}&currency=EGP&unit=g`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `metals.dev API error: ${response.status} ${response.statusText}`
      );
    }

    const data: MetalsApiResponse = await response.json();

    if (data.status !== "success") {
      throw new Error(`metals.dev API returned status: ${data.status}`);
    }

    // Extract only the values we need
    const marketRates: MarketRatesRow = {
      id: 1, // Single row table
      gold_egp_per_gram: data.metals.gold,
      silver_egp_per_gram: data.metals.silver,
      usd_egp: data.currencies.USD,
      eur_egp: data.currencies.EUR,
      timestamp: data.timestamps.metal,
      created_at: new Date().toISOString(),
    };

    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert into market_rates table
    const { error: upsertError } = await supabase
      .from("market_rates")
      .upsert(marketRates, { onConflict: "id" });

    if (upsertError) {
      throw new Error(`Database upsert failed: ${upsertError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Market rates updated successfully",
        data: {
          goldEgpPerGram: marketRates.gold_egp_per_gram,
          silverEgpPerGram: marketRates.silver_egp_per_gram,
          usdEgp: marketRates.usd_egp,
          eurEgp: marketRates.eur_egp,
          timestamp: marketRates.timestamp,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("fetch-metal-rates error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
