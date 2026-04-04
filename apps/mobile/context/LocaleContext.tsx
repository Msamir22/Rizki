import React, { createContext, useContext, useMemo } from "react";
import { I18nManager } from "react-native";
import i18n from "../i18n";
import { getLocaleFontFamily } from "../constants/typography";

/**
 * Supported languages in the app
 */
export type SupportedLanguage = "en" | "ar";

/**
 * Locale context state
 */
interface LocaleContextType {
  /** Current language code */
  language: SupportedLanguage;
  /** Whether the app is in RTL mode */
  isRTL: boolean;
  /** Locale-appropriate font family based on current language */
  fontFamily: Readonly<{
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  }>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

/**
 * LocaleProvider component that provides locale information to the app.
 *
 * This context exposes the current language, RTL state, and locale-appropriate
 * font family. It reads from the i18next instance and I18nManager to ensure
 * consistency across the app.
 */
export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useMemo<LocaleContextType>(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      language:
        (i18n as Record<string, unknown>).language === "ar" ? "ar" : "en",
      isRTL: I18nManager.isRTL,
      fontFamily: getLocaleFontFamily(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [(i18n as Record<string, unknown>).language]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

/**
 * Custom hook to use the locale context.
 *
 * Provides access to:
 * - `language`: Current language code ("en" or "ar")
 * - `isRTL`: Whether the app is in RTL mode
 * - `fontFamily`: Locale-appropriate font family for inline styles
 *
 * @example
 * ```tsx
 * const { language, isRTL, fontFamily } = useLocale();
 *
 * // Use in inline styles (not NativeWind className)
 * <Text style={{ fontFamily: fontFamily.bold }}>Title</Text>
 *
 * // Check RTL for conditional logic
 * if (isRTL) {
 *   // Apply RTL-specific logic
 * }
 * ```
 */
export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
