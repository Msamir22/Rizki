/**
 * useBudgetAlert Hook
 *
 * Manages budget alert modal visibility and alert data.
 * Called after transaction creation to check for threshold crossings.
 *
 * @module useBudgetAlert
 */

import { useState, useCallback } from "react";
import { router } from "expo-router";
import type { Transaction } from "@astik/db";
import {
  checkBudgetAlerts,
  type BudgetAlert,
} from "@/services/budget-alert-service";

// =============================================================================
// TYPES
// =============================================================================

interface UseBudgetAlertResult {
  /** Current alert data (null if no alert) */
  readonly alert: BudgetAlert | null;
  /** Whether the alert modal is visible */
  readonly isVisible: boolean;
  /** Call after creating a transaction to check for alerts */
  readonly checkAfterTransaction: (transaction: Transaction) => Promise<void>;
  /** Dismiss the alert modal */
  readonly dismiss: () => void;
  /** Navigate to the budget detail screen */
  readonly viewBudget: (budgetId: string) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useBudgetAlert(): UseBudgetAlertResult {
  const [alert, setAlert] = useState<BudgetAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkAfterTransaction = useCallback(
    async (transaction: Transaction): Promise<void> => {
      const result = await checkBudgetAlerts(transaction);
      if (result) {
        setAlert(result);
        setIsVisible(true);
      }
    },
    []
  );

  const dismiss = useCallback((): void => {
    setIsVisible(false);
    setAlert(null);
  }, []);

  const viewBudget = useCallback((budgetId: string): void => {
    setIsVisible(false);
    setAlert(null);
    router.push(`/budget-detail?id=${budgetId}`);
  }, []);

  return {
    alert,
    isVisible,
    checkAfterTransaction,
    dismiss,
    viewBudget,
  };
}
