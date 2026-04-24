import React, { useCallback, useState } from "react";
import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useIntroLocaleOverride } from "@/hooks/useIntroLocaleOverride";
import { logger } from "@/utils/logger";

export function LanguageSwitcherPill(): React.ReactElement {
  const { i18n } = useTranslation();
  const { setOverride } = useIntroLocaleOverride();
  const [isChanging, setIsChanging] = useState(false);

  const currentLang = i18n.language === "ar" ? "ar" : "en";
  const nextLang = currentLang === "en" ? "ar" : "en";

  // Debounce repeated taps: `setOverride` writes AsyncStorage AND triggers
  // `changeLanguage` (which can reload the app on RTL flip). Queuing two
  // calls back-to-back can race the reload. Disable the pill while a
  // previous change is in flight.
  const handlePress = useCallback((): void => {
    if (isChanging) return;
    setIsChanging(true);
    setOverride(nextLang)
      .catch((error: unknown) => {
        logger.warn(
          "LanguageSwitcherPill.setOverride.failed",
          error instanceof Error ? { message: error.message } : { error }
        );
      })
      .finally(() => {
        setIsChanging(false);
      });
  }, [isChanging, setOverride, nextLang]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isChanging}
      accessibilityRole="button"
      accessibilityState={{ disabled: isChanging }}
      className="flex-row items-center rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800"
      style={{ gap: 4, opacity: isChanging ? 0.6 : 1 }}
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
