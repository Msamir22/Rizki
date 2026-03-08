/**
 * Signup Prompt Service — Persistence & Query Layer
 *
 * Encapsulates all AsyncStorage reads/writes and WatermelonDB queries
 * for the sign-up prompt feature. Keeps the useSignUpPrompt hook as
 * a thin React wrapper.
 *
 * Architecture & Design Rationale:
 * - Pattern: Service-Layer Separation (Constitution IV)
 * - Why: Persistence logic does not belong in hooks or components.
 *   Extracting it makes the logic independently testable and reusable.
 * - SOLID: SRP — this service only handles prompt data operations.
 *
 * @module signup-prompt-service
 */

import {
  FIRST_USE_DATE_KEY,
  SIGNUP_COOLDOWN_DAYS,
  SIGNUP_COOLDOWN_TX,
  SIGNUP_DAYS_THRESHOLD,
  SIGNUP_PROMPT_DISMISSED_AT_KEY,
  SIGNUP_PROMPT_DISMISSED_TX_COUNT_KEY,
  SIGNUP_PROMPT_NEVER_SHOW_KEY,
  SIGNUP_TX_THRESHOLD,
} from "@/constants/storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// Types
// =============================================================================

export interface UserStats {
  readonly transactionCount: number;
  readonly accountCount: number;
  readonly totalAmount: number;
}

interface PromptCheckResult {
  readonly shouldShow: boolean;
  readonly stats: UserStats;
}

// =============================================================================
// Constants
// =============================================================================

const MS_PER_DAY = 86_400_000;

// =============================================================================
// Public API
// =============================================================================

/**
 * Check whether the sign-up urgency prompt should be displayed.
 *
 * Steps:
 * 1. If permanently dismissed → return false
 * 2. Query user stats from WatermelonDB
 * 3. If previously dismissed → check cooldown thresholds
 * 4. Otherwise → check initial thresholds (50 txns or 10 days)
 */
export async function checkShouldShowPrompt(): Promise<PromptCheckResult> {
  // 1. Check permanent dismiss
  const neverShow = await AsyncStorage.getItem(SIGNUP_PROMPT_NEVER_SHOW_KEY);
  if (neverShow === "true") {
    return { shouldShow: false, stats: emptyStats() };
  }

  // 2. Get stats from WatermelonDB
  const stats = await getUserStats();

  // 3. Get dismissal state
  const dismissedAt = await AsyncStorage.getItem(
    SIGNUP_PROMPT_DISMISSED_AT_KEY
  );
  const dismissedTxCount = await AsyncStorage.getItem(
    SIGNUP_PROMPT_DISMISSED_TX_COUNT_KEY
  );

  // 4. Get first-use date
  const firstUseDate = await getFirstUseDate();

  // 5. Calculate thresholds
  if (dismissedAt && dismissedTxCount) {
    // User previously dismissed — check cooldown
    const daysSinceDismiss = getDaysBetween(
      new Date(dismissedAt),
      new Date()
    );
    const txSinceDismiss =
      stats.transactionCount - parseInt(dismissedTxCount, 10);

    const cooldownMet =
      txSinceDismiss >= SIGNUP_COOLDOWN_TX ||
      daysSinceDismiss >= SIGNUP_COOLDOWN_DAYS;

    return { shouldShow: cooldownMet, stats };
  }

  // Never dismissed — check initial thresholds
  const daysSinceFirstUse = getDaysBetween(firstUseDate, new Date());
  const thresholdMet =
    stats.transactionCount >= SIGNUP_TX_THRESHOLD ||
    daysSinceFirstUse >= SIGNUP_DAYS_THRESHOLD;

  return { shouldShow: thresholdMet, stats };
}

/**
 * Save a cooldown dismissal ("Skip for now").
 * Records the current timestamp and transaction count.
 */
export async function saveCooldownDismissal(
  currentTxCount: number
): Promise<void> {
  await AsyncStorage.setItem(
    SIGNUP_PROMPT_DISMISSED_AT_KEY,
    new Date().toISOString()
  );
  await AsyncStorage.setItem(
    SIGNUP_PROMPT_DISMISSED_TX_COUNT_KEY,
    String(currentTxCount)
  );
}

/**
 * Save a permanent dismissal ("Never show this again").
 */
export async function savePermanentDismissal(): Promise<void> {
  await AsyncStorage.setItem(SIGNUP_PROMPT_NEVER_SHOW_KEY, "true");
}

/**
 * Get user stats from WatermelonDB.
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    // Lazy import to avoid circular deps and keep the service testable
    const { database } = await import("@astik/db");

    const transactionCount = await database
      .get("transactions")
      .query()
      .fetchCount();
    const accountCount = await database.get("accounts").query().fetchCount();

    // Query total amount from transactions.
    // WatermelonDB doesn't support SUM aggregation directly,
    // so we fetch all records and sum the amounts via _raw.
    const allTransactions = await database
      .get("transactions")
      .query()
      .fetch();

    let totalAmount = 0;
    for (const tx of allTransactions) {
      // WatermelonDB Model exposes _raw as a DirtyRaw (Record<string, unknown>)
      const raw = (tx as unknown as { _raw: Record<string, unknown> })._raw;
      const amount = Number(raw.amount);
      if (Number.isFinite(amount)) {
        totalAmount += Math.abs(amount);
      }
    }

    return { transactionCount, accountCount, totalAmount };
  } catch {
    return emptyStats();
  }
}

// =============================================================================
// Internal Helpers
// =============================================================================

/** Get the first use date, recording it if not yet set. */
async function getFirstUseDate(): Promise<Date> {
  const stored = await AsyncStorage.getItem(FIRST_USE_DATE_KEY);
  if (stored) {
    return new Date(stored);
  }

  // First time — record now
  const now = new Date().toISOString();
  await AsyncStorage.setItem(FIRST_USE_DATE_KEY, now);
  return new Date(now);
}

/** Calculate whole days between two dates. */
function getDaysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/** Empty stats default. */
function emptyStats(): UserStats {
  return { transactionCount: 0, accountCount: 0, totalAmount: 0 };
}
