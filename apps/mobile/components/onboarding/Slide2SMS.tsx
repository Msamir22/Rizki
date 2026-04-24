import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PitchMockCard } from "./PitchMockCard";

export function Slide2SMS(): React.ReactElement {
  const { t } = useTranslation("onboarding");

  return (
    <PitchMockCard>
      {/* Bank message bubble */}
      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t("pitch_slide_sms_bank_label")}
      </Text>
      <Text className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {t("pitch_slide_sms_bank_body")}
      </Text>

      {/* Detection row */}
      <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-medium text-nileGreen-600 dark:text-nileGreen-400">
            {t("pitch_slide_sms_category_groceries")}
          </Text>
          <Text className="text-xs text-nileGreen-500 dark:text-nileGreen-400">
            {t("pitch_slide_sms_detected")}
          </Text>
        </View>
        <View className="rounded-full bg-nileGreen-500/20 px-3 py-1">
          <Text className="text-xs font-medium text-nileGreen-700 dark:text-nileGreen-300">
            {t("pitch_slide_sms_status_imported")}
          </Text>
        </View>
      </View>
    </PitchMockCard>
  );
}
