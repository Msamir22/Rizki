/**
 * Category UI Fallbacks
 *
 * These are fallback visual properties for categories when not loaded from DB.
 * The primary source of truth is WatermelonDB (synced from Supabase).
 *
 * Use the useCategories hook to get categories from the database.
 */

import { Category } from "@astik/db";

// Re-export the hook for convenience
export { useCategories, useCategory } from "../hooks/useCategories";

/**
 * Default colors for categories if not specified in DB
 * Keys are system_name values
 */
export const CATEGORY_FALLBACK_COLORS: Record<string, string> = {
  // Expenses
  food: "#F59E0B",
  transport: "#3B82F6",
  shopping: "#EC4899",
  utilities: "#8B5CF6",
  entertainment: "#14B8A6",
  health: "#EF4444",
  education: "#F97316",
  housing: "#6366F1",
  personal_care: "#F472B6",
  subscriptions: "#0EA5E9",
  gifts: "#A855F7",
  travel: "#06B6D4",
  other_expense: "#9CA3AF",

  // Income
  salary: "#10B981",
  freelance: "#22C55E",
  investments: "#059669",
  rental_income: "#0D9488",
  business_income: "#14B8A6",
  other_income: "#34D399",

  // Fallback
  default: "#9CA3AF",
};

/**
 * Get color for a category, with fallback
 */
export function getCategoryColor(
  category: Category | null | undefined
): string {
  if (!category) return CATEGORY_FALLBACK_COLORS.default;
  if (category.color) return category.color;
  return (
    CATEGORY_FALLBACK_COLORS[category.systemName] ||
    CATEGORY_FALLBACK_COLORS.default
  );
}

/**
 * Get icon for a category, with fallback
 */
export function getCategoryIcon(category: Category | null | undefined): string {
  if (!category) return "ellipsis-horizontal";
  return category.icon || "ellipsis-horizontal";
}
