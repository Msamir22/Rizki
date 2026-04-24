import React, { useCallback } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { AnchoredTooltip } from "@/components/ui/AnchoredTooltip";
import { useFirstRunTooltip } from "@/context/FirstRunTooltipContext";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";
import { useOnboardingFlags } from "@/hooks/useOnboardingFlags";
import { useSmsSync } from "@/hooks/useSmsSync";
import { setOnboardingFlag } from "@/services/profile-service";
import { logger } from "@/utils/logger";

interface CashAccountTooltipProps {
  readonly anchorRef: React.RefObject<View>;
}

export function CashAccountTooltip({
  anchorRef,
}: CashAccountTooltipProps): React.ReactElement | null {
  const { t } = useTranslation("onboarding");
  const { isFirstRunPending, markFirstRunConsumed } = useFirstRunTooltip();
  const { shouldShowPrompt } = useSmsSync();
  const flags = useOnboardingFlags();

  const visible =
    isFirstRunPending &&
    !shouldShowPrompt &&
    !flags.cash_account_tooltip_dismissed;

  const handleDismiss = useCallback((): void => {
    setOnboardingFlag("cash_account_tooltip_dismissed", true)
      .then(() => {
        markFirstRunConsumed();
      })
      .catch((error: unknown) => {
        logger.warn(
          "cashAccountTooltip.dismiss.failed",
          error instanceof Error ? { message: error.message } : undefined
        );
        // Still mark consumed locally — the tooltip UX should not be blocked
        // by a transient write failure; sync will retry.
        markFirstRunConsumed();
      });
  }, [markFirstRunConsumed]);

  // Android hardware-back while visible → same path as "Got it"
  useDismissOnBack(visible, handleDismiss);

  if (!visible) return null;

  return (
    <AnchoredTooltip
      visible={visible}
      anchorRef={anchorRef}
      title={t("cash_account_tooltip_title")}
      body={t("cash_account_tooltip_body")}
      primaryLabel={t("cash_account_tooltip_got_it")}
      onPrimaryPress={handleDismiss}
      anchorSide="above"
    />
  );
}
