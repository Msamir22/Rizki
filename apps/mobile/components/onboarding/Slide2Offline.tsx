import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PitchMockCard } from "./PitchMockCard";

export function Slide2Offline(): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <PitchMockCard>
      {/* Status pills */}
      <View className="flex-row items-center gap-2">
        <View className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t("pitch_slide_offline_status_offline")}
          </Text>
        </View>
        <View className="rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/30">
          <Text className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {t("pitch_slide_offline_status_instant")}
          </Text>
        </View>
      </View>

      {/* Recently added header */}
      <Text className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("pitch_slide_offline_recently_added")}
      </Text>

      {/* Placeholder items */}
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="mt-2 h-3 rounded bg-slate-100 dark:bg-slate-700"
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}

      {/* Bottom status */}
      <View className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
        <Text className="text-xs font-medium text-nileGreen-600 dark:text-nileGreen-400">
          {t("pitch_slide_offline_all_saved")}
        </Text>
      </View>
    </PitchMockCard>
  );
}
