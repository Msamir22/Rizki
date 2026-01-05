/**
 * Shared Types for WatermelonDB Models
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 */

// =============================================================================
// ENUM TYPES (from Supabase)
// =============================================================================

export type AccountType = "CASH" | "BANK" | "DIGITAL_WALLET";
export type AssetType = "METAL" | "CRYPTO" | "REAL_ESTATE";
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "CUSTOM";
export type BudgetStatus = "ACTIVE" | "PAUSED";
export type BudgetType = "CATEGORY" | "GLOBAL";
export type CategoryNature = "WANT" | "NEED" | "MUST";
export type DebtStatus = "ACTIVE" | "PARTIALLY_PAID" | "SETTLED" | "WRITTEN_OFF";
export type DebtType = "LENT" | "BORROWED";
export type MetalType = "GOLD" | "SILVER" | "PLATINUM";
export type RecurringAction = "AUTO_CREATE" | "NOTIFY";
export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM";
export type RecurringStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";
export type TransactionSource = "MANUAL" | "VOICE" | "SMS" | "RECURRING";
export type TransactionType = "EXPENSE" | "INCOME";

// =============================================================================
// COMMON TYPES
// =============================================================================

export type Currency = "EGP" | "USD" | "EUR";

// =============================================================================
// COMPLEX TYPES
// =============================================================================

export interface NotificationSettings {
  sms_transaction_confirmation: boolean;
  recurring_reminders: boolean;
  budget_alerts: boolean;
  low_balance_warnings: boolean;
}
