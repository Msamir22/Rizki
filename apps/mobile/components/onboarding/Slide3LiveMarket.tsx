import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PitchMockCard } from "./PitchMockCard";

export function Slide3LiveMarket(): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <PitchMockCard>
      {/* Net worth header */}
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("pitch_slide_live_market_net_worth_label")}
      </Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        12,450 {/* i18n-ignore: ISO currency code, not translatable */}
        <Text className="text-base font-normal text-slate-400">EGP</Text>
      </Text>

      {/* Rate cards */}
      <View className="mt-4 gap-2">
        <View className="flex-row items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("pitch_slide_live_market_gold_label")}
          </Text>
          <Text className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            ↑ 4,320
          </Text>
        </View>
        <View className="flex-row items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("pitch_slide_live_market_silver_label")}
          </Text>
          <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            52.40
          </Text>
        </View>
        <View className="flex-row items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("pitch_slide_live_market_usd_label")}
          </Text>
          <Text className="text-sm font-semibold text-nileGreen-600 dark:text-nileGreen-400">
            50.85
          </Text>
        </View>
      </View>

      {/* Live caption */}
      <Text className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {t("pitch_slide_live_market_live_caption", { minutes: 3 })}
      </Text>
    </PitchMockCard>
  );
}
