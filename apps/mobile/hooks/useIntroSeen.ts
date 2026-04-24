import { useEffect, useState } from "react";
import { readIntroSeen } from "@/services/intro-flag-service";

export function useIntroSeen(): {
  readonly isSeen: boolean;
  readonly isLoading: boolean;
} {
  const [isSeen, setIsSeen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    readIntroSeen().then((value) => {
      if (!cancelled) {
        setIsSeen(value);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isSeen, isLoading };
}
