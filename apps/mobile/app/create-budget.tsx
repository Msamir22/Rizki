/**
 * Create/Edit Budget Screen
 *
 * Route page for creating a new budget or editing an existing one.
 * When `id` query param is present, loads budget for edit mode.
 *
 * @module create-budget
 */

import { PageHeader } from "@/components/navigation/PageHeader";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { Budget, database } from "@astik/db";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { palette } from "@/constants/colors";

// =============================================================================
// Screen
// =============================================================================

export default function CreateBudgetScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [budget, setBudget] = useState<Budget | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    const budgetId = id;

    async function loadBudget(): Promise<void> {
      try {
        const found = await database.get<Budget>("budgets").find(budgetId);
        setBudget(found);
      } catch {
        // Budget not found — treat as create mode
      } finally {
        setIsLoading(false);
      }
    }

    void loadBudget();
  }, [id]);

  return (
    <View className="flex-1">
      <PageHeader
        title={isEdit ? "Edit Budget" : "New Budget"}
        showBackButton={true}
        showDrawer={false}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={palette.nileGreen[500]} />
        </View>
      ) : (
        <BudgetForm existingBudget={budget} />
      )}
    </View>
  );
}
