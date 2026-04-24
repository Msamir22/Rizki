/**
 * Intro Flag Service
 *
 * AsyncStorage wrapper for device-scoped pre-auth flags that control the
 * intro / pitch experience and locale override.
 *
 * These flags are NOT user-specific and are NOT cleared on logout. They
 * survive sign-up / sign-out cycles because they represent device-level
 * preferences (FR-030).
 *
 * Architecture: Service Layer (Constitution IV) — plain async functions,
 * no React, no hooks.
 *
 * @module intro-flag-service
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  INTRO_LOCALE_OVERRIDE_KEY,
  INTRO_SEEN_KEY,
} from "@/constants/storage-keys";
import { logger } from "@/utils/logger";

// =============================================================================
// Types
// =============================================================================

/** Valid locale override values stored in AsyncStorage. */
type IntroLocale = "en" | "ar";

const VALID_LOCALES: ReadonlySet<IntroLocale> = new Set<IntroLocale>([
  "en",
  "ar",
]);

// =============================================================================
// Public API
// =============================================================================

/**
 * Read the intro-seen flag.
 *
 * Returns `true` only when the stored value is exactly `"true"`.
 * Returns `false` for absent keys, unexpected values, or storage errors.
 */
export async function readIntroSeen(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(INTRO_SEEN_KEY);
    return value === "true";
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn("[intro-flag] Failed to read intro-seen flag", {
        message: error.message,
      });
    }
    return false;
  }
}

/**
 * Persist the intro-seen flag. Idempotent — writing `"true"` when already
 * present is a no-op at the storage layer.
 */
export async function markIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, "true");
}

/**
 * Read the locale override chosen on a pre-auth surface.
 *
 * Returns the stored locale if it is a valid `"en"` | `"ar"` value, or
 * `null` when absent / invalid. Callers treat `null` as "use system locale".
 */
export async function readIntroLocaleOverride(): Promise<IntroLocale | null> {
  const raw = await AsyncStorage.getItem(INTRO_LOCALE_OVERRIDE_KEY);
  if (raw === null) return null;
  return VALID_LOCALES.has(raw as IntroLocale) ? (raw as IntroLocale) : null;
}

/**
 * Persist the locale override. Device-scoped — survives logout (FR-030).
 * There is intentionally no `clearIntroLocaleOverride` export; the override
 * persists forever.
 */
export async function setIntroLocaleOverride(lang: IntroLocale): Promise<void> {
  await AsyncStorage.setItem(INTRO_LOCALE_OVERRIDE_KEY, lang);
}
