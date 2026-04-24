import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PitchMockCard } from "./PitchMockCard";

export function Slide1Voice(): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <PitchMockCard>
      {/* Transcript bubble */}
      <Text className="text-base leading-relaxed text-slate-800 dark:text-slate-100">
        &ldquo;{t("pitch_slide_voice_transcript")}&rdquo;
      </Text>

      {/* Status row */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="rounded-full bg-nileGreen-500/20 px-3 py-1">
          <Text className="text-xs font-medium text-nileGreen-700 dark:text-nileGreen-300">
            {t("pitch_slide_voice_status_saved")}
          </Text>
        </View>
        <Text className="text-xs text-slate-400">
          {t("pitch_slide_voice_status_just_now")}
        </Text>
      </View>

      {/* Category + Account row */}
      <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t("pitch_slide_voice_category_food")}
        </Text>
        <Text className="text-sm text-slate-400">
          {t("pitch_slide_voice_account")}
        </Text>
      </View>
    </PitchMockCard>
  );
}
