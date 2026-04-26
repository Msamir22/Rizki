import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/colors";
import { LanguageSwitcherPill } from "./LanguageSwitcherPill";

interface PitchSlideProps {
  readonly headline: string;
  readonly subhead: string;
  /** True only on the last slide — switches Skip → hidden, CTA → "Get Started". */
  readonly isLast: boolean;
  /** True on every slide except the first — used to render the top-left
   *  back-arrow (replacing the language pill). Slide 1 keeps the language
   *  pill at top-left because there is nowhere to go back to. */
  readonly hasPrevious: boolean;
  readonly onSkip: () => void;
  readonly onPrevious: () => void;
  readonly onAdvance: () => void;
  readonly children: React.ReactNode;
}

/**
 * Layout per mockups (`01-slide-voice.png`, `02a-slide-sms-android.png`,
 * `02b-slide-offline-ios.png`, `03-slide-live-market.png`) and the
 * 2026-04-26 user feedback round:
 *
 * Top bar
 *   - Slide 1: language picker (top-start) + Skip (top-end).
 *   - Slides 2 & 3: back-arrow (top-start) + Skip (top-end on slide 2 only).
 *
 * Body (centered)
 *   - Headline (no eyebrow — removed 2026-04-26).
 *   - Subhead.
 *   - Mock-content card (children) — sits close to the subhead, no large
 *     vertical gap.
 *
 * Bottom
 *   - Pagination dots positioned just above the CTA so they never overlap.
 *   - CTA — "Continue" on slides 1–2, "Get Started" on the last slide.
 *     There is NO inline back-arrow next to the CTA on the last slide;
 *     the back-arrow lives at the top-left instead.
 *
 * Theme
 *   - The slide root has no forced background — it inherits whatever the
 *     stack's contentStyle decides (system theme).
 */
export function PitchSlide({
  headline,
  subhead,
  isLast,
  hasPrevious,
  onSkip,
  onPrevious,
  onAdvance,
  children,
}: PitchSlideProps): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <View className="flex-1 px-6 pt-14 bg-background dark:bg-background-dark">
      {/* Top bar — back-arrow on slides 2+3, language pill on slide 1 only. */}
      <View className="flex-row items-center justify-between">
        {hasPrevious ? (
          <Pressable
            onPress={onPrevious}
            accessibilityRole="button"
            accessibilityLabel={t("pitch_back")}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={palette.slate[600]}
            />
          </Pressable>
        ) : (
          <LanguageSwitcherPill />
        )}
        {!isLast ? (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("pitch_skip")}
            </Text>
          </Pressable>
        ) : (
          // Empty placeholder so the back-arrow stays anchored at the start.
          <View />
        )}
      </View>

      {/* Centered headline + subhead */}
      <Text className="mt-10 text-center text-3xl font-bold leading-tight text-slate-900 dark:text-white">
        {headline}
      </Text>

      <Text className="mt-3 text-center text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {subhead}
      </Text>

      {/* Mock-content card slot — uses justify-center to vertically center
          the card in the remaining space rather than pinning it to the very
          bottom (the previous `flex-1 + items-center justify-center` left a
          large gap between the subhead and the card on tall screens). */}
      <View className="my-6 flex-1 items-center justify-center">
        {children}
      </View>

      {/* Bottom CTA */}
      <Pressable
        onPress={onAdvance}
        accessibilityRole="button"
        accessibilityLabel={
          isLast ? t("pitch_get_started") : t("pitch_continue")
        }
        className="mb-8 items-center justify-center rounded-2xl bg-nileGreen-500 py-4 active:bg-nileGreen-600 dark:bg-nileGreen-600"
      >
        <Text className="text-base font-semibold text-white">
          {isLast ? t("pitch_get_started") : t("pitch_continue")}
        </Text>
      </Pressable>
    </View>
  );
}
