import { useCallback, useEffect, useState } from "react";
import {
  readIntroLocaleOverride,
  setIntroLocaleOverride,
} from "@/services/intro-flag-service";
import { changeLanguage } from "@/i18n/changeLanguage";

export function useIntroLocaleOverride(): {
  readonly override: "en" | "ar" | null;
  readonly setOverride: (lang: "en" | "ar") => Promise<void>;
  readonly isLoading: boolean;
} {
  const [override, setOverrideState] = useState<"en" | "ar" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    readIntroLocaleOverride().then((value) => {
      if (!cancelled) {
        setOverrideState(value);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setOverride = useCallback(async (lang: "en" | "ar"): Promise<void> => {
    await setIntroLocaleOverride(lang);
    await changeLanguage(lang);
    setOverrideState(lang);
  }, []);

  return { override, setOverride, isLoading };
}
