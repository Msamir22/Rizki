/**
 * LanguageSwitcherPill — inline language picker for pre-auth surfaces.
 *
 * Shows the CURRENT language with a chevron-down icon — the user can tell
 * at a glance which language they're in, and that the pill is a picker
 * (not a toggle) per the 2026-04-26 user direction.
 *
 * On tap, an anchored popover opens directly underneath the pill with one
 * row per supported locale. Selecting a row writes the device-scoped
 * `@rizqi/intro-locale-override` AsyncStorage key (FR-030) and applies the
 * change to the runtime via `changeLanguage`. Selecting the language
 * that's already active simply closes the popover (no-op, no spurious
 * RTL reload).
 *
 * Architecture / Pattern: small disclosure popover. Renders an absolute-
 * positioned overlay pinned to the `Pressable` ref via `measureInWindow`,
 * mirroring the `AnchoredTooltip` pattern but trimmed to a list. Uses
 * StyleSheet for the overlay layer to dodge the NativeWind v4 modal
 * race-condition (`.claude/rules/android-modal-overlay-pattern.md`).
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type LayoutRectangle,
  type View as RNView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useIntroLocaleOverride } from "@/hooks/useIntroLocaleOverride";
import { setPreferredLanguage } from "@/services/profile-service";
import { logger } from "@/utils/logger";

type SupportedLocale = "en" | "ar";

interface LocaleOption {
  readonly code: SupportedLocale;
  /** Native-label name shown in the popover (always self-named, never
   *  translated, so a user lost in another language can find their own). */
  readonly nativeLabel: string;
}

const LOCALES: readonly LocaleOption[] = [
  { code: "en", nativeLabel: "English" },
  { code: "ar", nativeLabel: "العربية" },
];

const PILL_WIDTH_FALLBACK = 80;
const POPOVER_WIDTH = 160;
const POPOVER_MARGIN_TOP = 6;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  // Transparent click-eater behind the popover. Tap = close.
  backdrop: StyleSheet.absoluteFillObject,
  popoverLight: {
    position: "absolute",
    width: POPOVER_WIDTH,
    backgroundColor: palette.slate[25],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.slate[200],
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  popoverDark: {
    position: "absolute",
    width: POPOVER_WIDTH,
    backgroundColor: palette.slate[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.slate[700],
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});

export function LanguageSwitcherPill(): React.ReactElement {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const { setOverride } = useIntroLocaleOverride();
  // Used to decide whether the language change must ALSO be persisted to
  // the user's profile. Pre-auth callers (slides, auth screen) have no
  // profile yet — `setOverride` alone is correct. Post-auth callers
  // (CurrencyStep, in-app settings) MUST also update
  // `profile.preferred_language`, otherwise `AppReadyGate` re-syncs i18n
  // back to the stale profile value on the next reload (the 2026-04-26
  // user-reported bug where Arabic in Currency-step "didn't stick").
  const { isAuthenticated } = useAuth();
  const pillRef = useRef<RNView | null>(null);
  const [pillRect, setPillRect] = useState<LayoutRectangle | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLang: SupportedLocale = i18n.language === "ar" ? "ar" : "en";

  /**
   * Open the popover after measuring the pill's screen position. We measure
   * on press rather than on layout because measureInWindow can return 0×0
   * during the initial render in a Stack screen (the same race that
   * `AnchoredTooltip` works around — see its `requestAnimationFrame` retry).
   */
  const handlePress = useCallback((): void => {
    if (isChanging) return;
    pillRef.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) {
        // Defensive — bail rather than render a popover at (0,0).
        logger.warn("LanguageSwitcherPill.measure.zero");
        return;
      }
      setPillRect({ x, y, width, height });
      setIsOpen(true);
    });
  }, [isChanging]);

  const handleClose = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (lang: SupportedLocale): void => {
      handleClose();
      // No-op if the user picked the language that's already active.
      // `changeLanguage` would still trigger the i18next event chain and
      // potentially an unnecessary RTL reload check. Skip it cleanly.
      if (lang === currentLang) {
        return;
      }
      setIsChanging(true);
      // Always write the override first so a cold launch (after the RTL
      // reload) starts in the right language. Then, when authenticated,
      // also persist to the profile so `AppReadyGate` won't override it
      // back. Order matters — if we wrote the profile first and the RTL
      // reload happened before the override write committed, AsyncStorage
      // would be one tick behind and the splash would show the old locale.
      const persist = async (): Promise<void> => {
        await setOverride(lang);
        if (isAuthenticated) {
          await setPreferredLanguage(lang);
        }
      };
      persist()
        .catch((error: unknown) => {
          logger.warn(
            "LanguageSwitcherPill.setOverride.failed",
            error instanceof Error ? { message: error.message } : { error }
          );
        })
        .finally(() => {
          setIsChanging(false);
        });
    },
    [currentLang, setOverride, handleClose, isAuthenticated]
  );

  const popoverLeft = pillRect?.x ?? 0;
  const popoverTop = pillRect
    ? pillRect.y + pillRect.height + POPOVER_MARGIN_TOP
    : 0;

  return (
    <>
      <Pressable
        ref={pillRef}
        onPress={handlePress}
        disabled={isChanging}
        accessibilityRole="button"
        accessibilityState={{ disabled: isChanging, expanded: isOpen }}
        accessibilityLabel={`Language: ${currentLang.toUpperCase()}`}
        className="flex-row items-center rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800"
        style={{
          columnGap: 4,
          opacity: isChanging ? 0.6 : 1,
          minWidth: PILL_WIDTH_FALLBACK,
          justifyContent: "center",
        }}
      >
        <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
          🌐
        </Text>
        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {currentLang}
        </Text>
        <Ionicons
          name="chevron-down"
          size={12}
          color={isDark ? palette.slate[400] : palette.slate[500]}
        />
      </Pressable>

      {isOpen && pillRect && (
        <View style={styles.overlay}>
          {/* Backdrop — tap anywhere outside the popover to dismiss. */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Popover */}
          <View
            style={[
              isDark ? styles.popoverDark : styles.popoverLight,
              { left: popoverLeft, top: popoverTop },
            ]}
          >
            {LOCALES.map((option, idx) => {
              const isActive = option.code === currentLang;
              const isFirst = idx === 0;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => handleSelect(option.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.optionRow,
                    !isFirst && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: isDark
                        ? palette.slate[700]
                        : palette.slate[200],
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isDark ? palette.slate[200] : palette.slate[800],
                      fontSize: 14,
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {option.nativeLabel}
                  </Text>
                  {isActive && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={palette.nileGreen[500]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </>
  );
}
