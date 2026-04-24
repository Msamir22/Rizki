import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { LanguageSwitcherPill } from "./LanguageSwitcherPill";

interface PitchSlideProps {
  readonly eyebrow: string;
  readonly headline: string;
  readonly subhead: string;
  readonly isLast: boolean;
  readonly onSkip: () => void;
  readonly onGetStarted: () => void;
  readonly children: React.ReactNode;
}

export function PitchSlide({
  eyebrow,
  headline,
  subhead,
  isLast,
  onSkip,
  onGetStarted,
  children,
}: PitchSlideProps): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <View className="flex-1 px-6 pt-14">
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <LanguageSwitcherPill />
        {!isLast && (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("pitch_skip")}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Eyebrow */}
      <Text className="mt-8 text-xs font-semibold uppercase tracking-widest text-nileGreen-600 dark:text-nileGreen-400">
        {eyebrow}
      </Text>

      {/* Headline */}
      <Text className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
        {headline}
      </Text>

      {/* Subhead */}
      <Text className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {subhead}
      </Text>

      {/* Mock frame content slot */}
      <View className="mt-8 flex-1 items-center justify-center">
        {children}
      </View>

      {/* Bottom CTA */}
      {isLast && (
        <Pressable
          onPress={onGetStarted}
          className="mb-8 items-center rounded-2xl bg-nileGreen-500 py-4 active:bg-nileGreen-600 dark:bg-nileGreen-600"
        >
          <Text className="text-base font-semibold text-white">
            {t("pitch_get_started")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
