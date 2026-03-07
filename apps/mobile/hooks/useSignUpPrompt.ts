/**
 * useSignUpPrompt — Urgency Prompt Visibility Hook
 *
 * Centralizes all trigger, cooldown, and permanent-dismiss logic for
 * the re-engagement sign-up prompt (US2).
 *
 * Architecture & Design Rationale:
 * - Pattern: Custom Hook (extracts logic from UI components — SRP)
 * - Why: Keeps SignUpPromptSheet purely presentational. All threshold
 *   checks, AsyncStorage reads, and WatermelonDB queries live here.
 * - SOLID: SRP + DIP — hook depends on abstract storage/keys,
 *   not concrete component state.
 *
 * @module useSignUpPrompt
 */

import { useAuth } from "@/context/AuthContext";
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
import { useEffect, useState, useCallback } from "react";

// =============================================================================
// Types
// =============================================================================

interface SignUpPromptState {
  /** Whether the urgency prompt should be shown right now. */
  readonly shouldShowPrompt: boolean;
  /** User stats for display in the urgency sheet. */
  readonly stats: UserStats;
  /** Dismiss with cooldown ("Skip for now"). */
  readonly dismissWithCooldown: () => Promise<void>;
  /** Dismiss permanently ("Never show this again"). */
  readonly dismissPermanently: () => Promise<void>;
}

interface UserStats {
  readonly transactionCount: number;
  readonly accountCount: number;
  readonly isLoading: boolean;
}

// =============================================================================
// Hook
// =============================================================================

export function useSignUpPrompt(): SignUpPromptState {
  const { isAnonymous } = useAuth();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    transactionCount: 0,
    accountCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!isAnonymous) {
      setShouldShowPrompt(false);
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    checkShouldShow().catch(() => {
      setShouldShowPrompt(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnonymous]);

  // ---------------------------------------------------------------------------
  // Core check logic
  // ---------------------------------------------------------------------------

  async function checkShouldShow(): Promise<void> {
    // 1. Check permanent dismiss
    const neverShow = await AsyncStorage.getItem(SIGNUP_PROMPT_NEVER_SHOW_KEY);
    if (neverShow === "true") {
      setShouldShowPrompt(false);
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // 2. Get stats from WatermelonDB
    const userStats = await getUserStats();
    setStats({ ...userStats, isLoading: false });

    // 3. Get dismissal state
    const dismissedAt = await AsyncStorage.getItem(
      SIGNUP_PROMPT_DISMISSED_AT_KEY
    );
    const dismissedTxCount = await AsyncStorage.getItem(
      SIGNUP_PROMPT_DISMISSED_TX_COUNT_KEY
    );

    // 4. Check first-use date
    const firstUseDate = await getFirstUseDate();

    // 5. Calculate thresholds
    if (dismissedAt && dismissedTxCount) {
      // User previously dismissed — check cooldown
      const daysSinceDismiss = getDaysBetween(
        new Date(dismissedAt),
        new Date()
      );
      const txSinceDismiss =
        userStats.transactionCount - parseInt(dismissedTxCount, 10);

      const cooldownMet =
        txSinceDismiss >= SIGNUP_COOLDOWN_TX ||
        daysSinceDismiss >= SIGNUP_COOLDOWN_DAYS;

      setShouldShowPrompt(cooldownMet);
    } else {
      // Never dismissed — check initial thresholds
      const daysSinceFirstUse = getDaysBetween(firstUseDate, new Date());
      const thresholdMet =
        userStats.transactionCount >= SIGNUP_TX_THRESHOLD ||
        daysSinceFirstUse >= SIGNUP_DAYS_THRESHOLD;

      setShouldShowPrompt(thresholdMet);
    }
  }

  // ---------------------------------------------------------------------------
  // Dismiss handlers
  // ---------------------------------------------------------------------------

  const dismissWithCooldown = useCallback(async (): Promise<void> => {
    setShouldShowPrompt(false);
    await AsyncStorage.setItem(
      SIGNUP_PROMPT_DISMISSED_AT_KEY,
      new Date().toISOString()
    );
    await AsyncStorage.setItem(
      SIGNUP_PROMPT_DISMISSED_TX_COUNT_KEY,
      String(stats.transactionCount)
    );
  }, [stats.transactionCount]);

  const dismissPermanently = useCallback(async (): Promise<void> => {
    setShouldShowPrompt(false);
    await AsyncStorage.setItem(SIGNUP_PROMPT_NEVER_SHOW_KEY, "true");
  }, []);

  return {
    shouldShowPrompt,
    stats,
    dismissWithCooldown,
    dismissPermanently,
  };
}

// =============================================================================
// Helpers
// =============================================================================

/** Get user stats from WatermelonDB. */
async function getUserStats(): Promise<
  Pick<UserStats, "transactionCount" | "accountCount">
> {
  try {
    // Lazy import to avoid circular deps and keep hook testable
    const { database } = await import("@astik/db");

    const transactions = await database
      .get("transactions")
      .query()
      .fetchCount();
    const accounts = await database.get("accounts").query().fetchCount();

    return { transactionCount: transactions, accountCount: accounts };
  } catch {
    return { transactionCount: 0, accountCount: 0 };
  }
}

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
  const MS_PER_DAY = 86_400_000;
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}
