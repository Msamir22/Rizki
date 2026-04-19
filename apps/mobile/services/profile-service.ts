/**
 * Profile Service
 *
 * Plain async functions for onboarding-related profile mutations.
 * Each write goes through WatermelonDB's `database.write()`; push-sync
 * to Supabase is non-blocking and happens on the existing cadence.
 *
 * Architecture: Service Layer (Constitution IV) — no React, no hooks.
 *
 * @module profile-service
 */

import {
  Profile,
  type CurrencyType,
  type PreferredLanguageCode,
  database,
} from "@rizqi/db";
import { ensureCashAccount } from "@/services/account-service";
import { clearOnboardingStep } from "@/services/onboarding-cursor-service";
import { logger } from "@/utils/logger";
import { t } from "i18next";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Returns the first non-deleted profile row. Throws if none exists —
 * a profile should always be present after the initial pull-sync.
 */
async function getProfile(): Promise<Profile> {
  const collection = database.get<Profile>("profiles");
  const profiles = await collection.query().fetch();
  const profile = profiles.find((p) => !p.deleted);
  if (!profile) {
    throw new Error(
      "No profile row found. Profile should exist after initial sync."
    );
  }
  return profile;
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Persist the user's chosen language to the profile row.
 * Resolves FR-007.
 */
export async function setPreferredLanguage(
  language: PreferredLanguageCode
): Promise<void> {
  const profile = await getProfile();
  await database.write(async () => {
    await profile.update((p) => {
      p.preferredLanguage = language;
    });
  });
}

/**
 * Atomic operation: set the user's preferred currency AND create the cash
 * account in that currency. Resolves FR-009 + FR-010.
 *
 * Both writes are wrapped in a single `database.write()` to prevent partial
 * state. The cash-account creation is delegated to `ensureCashAccount` which
 * is idempotent.
 */
export async function setPreferredCurrencyAndCreateCashAccount(
  currency: CurrencyType
): Promise<{ readonly accountId: string }> {
  const profile = await getProfile();
  const userId = profile.userId;

  let accountId: string | null = null;

  await database.write(async () => {
    await profile.update((p) => {
      p.preferredCurrency = currency;
    });

    const result = await ensureCashAccount(userId, currency);
    accountId = result.accountId;
  });

  if (!accountId) {
    throw new Error(t("cash_account_creation_failed"));
  }

  return { accountId };
}

/**
 * Flip the `onboarding_completed` flag to true AND clear the per-user
 * AsyncStorage cursor. Called exactly once per user when the cash-account
 * confirmation step is dismissed. Resolves FR-011.
 *
 * Lifecycle per contract:
 * 1. `database.write()` sets `onboarding_completed = true`.
 * 2. `clearOnboardingStep(userId)` removes `onboarding:<userId>:step`.
 *
 * If step 2 fails, the error is logged but NOT re-thrown. Step 1 is the
 * contract-critical write; the router reads the DB flag, so a stale cursor
 * is harmless.
 *
 * Idempotent — safe to call if already completed (no DB write; cursor
 * clear still runs defensively).
 */
export async function completeOnboarding(): Promise<void> {
  const profile = await getProfile();
  const userId = profile.userId;

  if (!profile.onboardingCompleted) {
    await database.write(async () => {
      await profile.update((p) => {
        p.onboardingCompleted = true;
      });
    });
  }

  try {
    await clearOnboardingStep(userId);
  } catch (error) {
    logger.warn(
      "onboarding.completeOnboarding.clearCursor.failed",
      error instanceof Error ? { message: error.message } : { error }
    );
  }
}
