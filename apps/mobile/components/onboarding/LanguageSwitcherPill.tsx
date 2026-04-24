import React, { useCallback } from "react";
import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useIntroLocaleOverride } from "@/hooks/useIntroLocaleOverride";

export function LanguageSwitcherPill(): React.ReactElement {
  const { i18n } = useTranslation();
  const { setOverride } = useIntroLocaleOverride();

  const currentLang = i18n.language === "ar" ? "ar" : "en";
  const nextLang = currentLang === "en" ? "ar" : "en";

  const handlePress = useCallback((): void => {
    void setOverride(nextLang);
  }, [setOverride, nextLang]);

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800"
      style={{ gap: 4 }}
    >
      <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
        🌐
      </Text>
      <Text className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
        {nextLang}
      </Text>
    </Pressable>
  );
}
