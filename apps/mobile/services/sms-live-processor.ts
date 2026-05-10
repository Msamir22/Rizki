import { database, type Category } from "@monyvi/db";
import {
  type ParsedSmsTransaction,
  computeSmsHash,
  isLikelyFinancialSms,
  SUPPORTED_CURRENCIES,
} from "@monyvi/logic";
import { Q } from "@nozbe/watermelondb";
import {
  parseSmsWithAi,
  type ParseSmsContext,
  type SmsCandidate,
} from "./ai-sms-parser-service";
import { reconcileLiveDetectionPreference } from "./sms-live-detection-handler";
import { hasExistingSmsBodyHash } from "./sms-dedup-service";
import { getCurrentUserDataScope } from "./user-data-access";
import { logger } from "@/utils/logger";

type LiveSmsDeliveryMode = "foreground" | "headless";

type LiveSmsProcessingStatus =
  | "disabled"
  | "ignored"
  | "duplicate"
  | "ai_failed"
  | "parsed";

export interface LiveSmsEvent {
  readonly sender: string;
  readonly body: string;
  readonly timestamp: number;
  readonly deliveryMode: LiveSmsDeliveryMode;
}

export interface LiveSmsProcessingResult {
  readonly status: LiveSmsProcessingStatus;
  readonly smsBodyHash?: string;
  readonly isRetryable?: boolean;
  readonly transactions: readonly ParsedSmsTransaction[];
}

interface LiveSmsProcessingOptions {
  readonly isRecentlyProcessed?: (smsBodyHash: string) => boolean;
  readonly markRecentlyProcessed?: (smsBodyHash: string) => void;
}

const EMPTY_TRANSACTIONS: readonly ParsedSmsTransaction[] = [];
const inFlightSmsBodyHashes = new Set<string>();

function createResult(
  status: LiveSmsProcessingStatus,
  smsBodyHash?: string,
  transactions: readonly ParsedSmsTransaction[] = EMPTY_TRANSACTIONS,
  isRetryable?: boolean
): LiveSmsProcessingResult {
  return { status, smsBodyHash, isRetryable, transactions };
}

async function loadAiContext(): Promise<ParseSmsContext> {
  const scope = await getCurrentUserDataScope();
  const categories = await scope
    .queryAccessibleCategories(
      database.get<Category>("categories"),
      Q.where("deleted", Q.notEq(true))
    )
    .fetch();

  return {
    categories,
    supportedCurrencies: SUPPORTED_CURRENCIES.map((currency) => currency.code),
  };
}

export async function processLiveSmsEvent(
  event: LiveSmsEvent,
  options: LiveSmsProcessingOptions = {}
): Promise<LiveSmsProcessingResult> {
  if (!isLikelyFinancialSms(event.body)) {
    return createResult("ignored");
  }

  const canRun = await reconcileLiveDetectionPreference();
  if (!canRun) {
    return createResult("disabled");
  }

  try {
    const smsBodyHash = await computeSmsHash(event.body);

    if (inFlightSmsBodyHashes.has(smsBodyHash)) {
      return createResult("duplicate", smsBodyHash);
    }

    if (options.isRecentlyProcessed?.(smsBodyHash)) {
      return createResult("duplicate", smsBodyHash);
    }

    if (await hasExistingSmsBodyHash(smsBodyHash)) {
      return createResult("duplicate", smsBodyHash);
    }

    inFlightSmsBodyHashes.add(smsBodyHash);
    try {
      const candidate: SmsCandidate = {
        message: {
          id: `live-${event.deliveryMode}-${event.timestamp}`,
          address: event.sender,
          body: event.body,
          date: event.timestamp,
          read: false,
        },
        smsBodyHash,
      };
      const aiResult = await parseSmsWithAi([candidate], await loadAiContext());

      if (aiResult.hasError === true) {
        return createResult(
          "ai_failed",
          smsBodyHash,
          EMPTY_TRANSACTIONS,
          aiResult.isRetryable !== false
        );
      }

      options.markRecentlyProcessed?.(smsBodyHash);

      if (aiResult.transactions.length === 0) {
        return createResult("ignored", smsBodyHash);
      }

      return createResult("parsed", smsBodyHash, aiResult.transactions);
    } finally {
      inFlightSmsBodyHashes.delete(smsBodyHash);
    }
  } catch (error: unknown) {
    logger.error("liveSms.process.failed", error, {
      deliveryMode: event.deliveryMode,
    });
    return createResult("ai_failed", undefined, EMPTY_TRANSACTIONS, true);
  }
}
