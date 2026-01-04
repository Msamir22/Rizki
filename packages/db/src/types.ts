/**
 * Shared Types for WatermelonDB Models
 * Centralized type definitions to avoid duplicate exports
 */

// ===========================================
// COMMON TYPES
// ===========================================

export type Currency = "EGP" | "USD" | "EUR";

// ===========================================
// PROFILE TYPES
// ===========================================

export interface NotificationSettings {
  sms_transaction_confirmation: boolean;
  recurring_reminders: boolean;
  budget_alerts: boolean;
  low_balance_warnings: boolean;
}

export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

// ===========================================
// ACCOUNT TYPES
// ===========================================

export type AccountType = "CASH" | "BANK" | "DIGITAL_WALLET";

// ===========================================
// ASSET TYPES
// ===========================================

export type AssetType = "METAL" | "CRYPTO" | "REAL_ESTATE";
export type MetalType = "GOLD" | "SILVER" | "PLATINUM";

// ===========================================
// CATEGORY TYPES
// ===========================================

export type CategoryNature = "WANT" | "NEED" | "MUST";
export type TransactionType = "EXPENSE" | "INCOME";

// ===========================================
// DEBT TYPES
// ===========================================

export type DebtType = "LENT" | "BORROWED";
export type DebtStatus =
  | "ACTIVE"
  | "PARTIALLY_PAID"
  | "SETTLED"
  | "WRITTEN_OFF";

// ===========================================
// RECURRING PAYMENT TYPES
// ===========================================

export type RecurringFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "CUSTOM";
export type RecurringAction = "AUTO_CREATE" | "NOTIFY";
export type RecurringStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

// ===========================================
// TRANSACTION TYPES
// ===========================================

export type TransactionSource = "MANUAL" | "VOICE" | "SMS" | "RECURRING";

// ===========================================
// BUDGET TYPES
// ===========================================

export type BudgetType = "CATEGORY" | "GLOBAL";
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "CUSTOM";
export type BudgetStatus = "ACTIVE" | "PAUSED";
