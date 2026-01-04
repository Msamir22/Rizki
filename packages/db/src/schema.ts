/**
 * WatermelonDB Schema for Astik
 * Version 2 - Complete schema matching Supabase
 * Defines database structure for offline-first architecture
 */

import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 2,
  tables: [
    // ===========================================
    // PROFILES
    // ===========================================
    tableSchema({
      name: "profiles",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "first_name", type: "string", isOptional: true },
        { name: "last_name", type: "string", isOptional: true },
        { name: "display_name", type: "string", isOptional: true },
        { name: "avatar_url", type: "string", isOptional: true },
        { name: "preferred_currency", type: "string" }, // EGP, USD, EUR
        { name: "theme", type: "string" }, // LIGHT, DARK, SYSTEM
        { name: "sms_detection_enabled", type: "boolean" },
        { name: "onboarding_completed", type: "boolean" },
        { name: "notification_settings", type: "string", isOptional: true }, // JSON string
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // ACCOUNTS
    // ===========================================
    tableSchema({
      name: "accounts",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // CASH, BANK, DIGITAL_WALLET
        { name: "balance", type: "number" },
        { name: "currency", type: "string" }, // EGP, USD, EUR
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // BANK_DETAILS
    // ===========================================
    tableSchema({
      name: "bank_details",
      columns: [
        { name: "account_id", type: "string", isIndexed: true },
        { name: "bank_name", type: "string" },
        { name: "card_last_4", type: "string" },
        { name: "sms_sender_name", type: "string", isOptional: true },
        { name: "account_number", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // ASSETS
    // ===========================================
    tableSchema({
      name: "assets",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // METAL, CRYPTO, REAL_ESTATE
        { name: "is_liquid", type: "boolean" },
        { name: "purchase_price", type: "number" },
        { name: "purchase_date", type: "number" }, // timestamp
        { name: "currency", type: "string" }, // EGP, USD, EUR
        { name: "notes", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // ASSET_METALS
    // ===========================================
    tableSchema({
      name: "asset_metals",
      columns: [
        { name: "asset_id", type: "string", isIndexed: true },
        { name: "metal_type", type: "string" }, // GOLD, SILVER, PLATINUM
        { name: "weight_grams", type: "number" },
        { name: "purity_karat", type: "number" },
        { name: "item_form", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
      ],
    }),

    // ===========================================
    // CATEGORIES
    // ===========================================
    tableSchema({
      name: "categories",
      columns: [
        { name: "user_id", type: "string", isOptional: true, isIndexed: true },
        {
          name: "parent_id",
          type: "string",
          isOptional: true,
          isIndexed: true,
        },
        { name: "system_name", type: "string" },
        { name: "display_name", type: "string" },
        { name: "icon", type: "string" },
        { name: "color", type: "string" }, // Hex color for UI (e.g., "#F59E0B")
        { name: "level", type: "number" }, // 1, 2, 3
        { name: "nature", type: "string", isOptional: true }, // WANT, NEED, MUST
        { name: "type", type: "string", isOptional: true }, // EXPENSE, INCOME
        { name: "is_system", type: "boolean" },
        { name: "is_hidden", type: "boolean" },
        { name: "is_internal", type: "boolean" },
        { name: "sort_order", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // USER_CATEGORY_SETTINGS
    // ===========================================
    tableSchema({
      name: "user_category_settings",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "category_id", type: "string", isIndexed: true },
        { name: "is_hidden", type: "boolean" },
        { name: "nature", type: "string", isOptional: true }, // WANT, NEED, MUST
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ===========================================
    // DEBTS
    // ===========================================
    tableSchema({
      name: "debts",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "type", type: "string" }, // LENT, BORROWED
        { name: "party_name", type: "string" },
        { name: "original_amount", type: "number" },
        { name: "outstanding_amount", type: "number" },
        { name: "account_id", type: "string", isIndexed: true },
        { name: "notes", type: "string", isOptional: true },
        { name: "date", type: "number" }, // timestamp
        { name: "due_date", type: "number", isOptional: true }, // timestamp
        { name: "status", type: "string" }, // ACTIVE, PARTIALLY_PAID, SETTLED, WRITTEN_OFF
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // RECURRING_PAYMENTS
    // ===========================================
    tableSchema({
      name: "recurring_payments",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "amount", type: "number" },
        { name: "type", type: "string" }, // EXPENSE, INCOME
        { name: "category_id", type: "string", isIndexed: true },
        { name: "account_id", type: "string", isIndexed: true },
        { name: "frequency", type: "string" }, // DAILY, WEEKLY, MONTHLY, etc.
        { name: "frequency_value", type: "number", isOptional: true },
        { name: "start_date", type: "number" }, // timestamp
        { name: "end_date", type: "number", isOptional: true }, // timestamp
        { name: "next_due_date", type: "number" }, // timestamp
        { name: "action", type: "string" }, // AUTO_CREATE, NOTIFY
        { name: "status", type: "string" }, // ACTIVE, PAUSED, COMPLETED
        { name: "linked_debt_id", type: "string", isOptional: true },
        { name: "notes", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // TRANSACTIONS
    // ===========================================
    tableSchema({
      name: "transactions",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "account_id", type: "string", isIndexed: true },
        { name: "amount", type: "number" },
        { name: "currency", type: "string" }, // EGP, USD, EUR
        { name: "type", type: "string" }, // EXPENSE, INCOME
        { name: "category_id", type: "string", isIndexed: true },
        { name: "merchant", type: "string", isOptional: true },
        { name: "note", type: "string", isOptional: true },
        { name: "date", type: "number" }, // timestamp
        { name: "source", type: "string" }, // MANUAL, VOICE, SMS, RECURRING
        { name: "is_draft", type: "boolean" },
        { name: "linked_debt_id", type: "string", isOptional: true },
        { name: "linked_asset_id", type: "string", isOptional: true },
        { name: "linked_recurring_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // TRANSFERS
    // ===========================================
    tableSchema({
      name: "transfers",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "from_account_id", type: "string", isIndexed: true },
        { name: "to_account_id", type: "string", isIndexed: true },
        { name: "amount", type: "number" },
        { name: "currency", type: "string" }, // source currency
        { name: "exchange_rate", type: "number", isOptional: true },
        { name: "converted_amount", type: "number", isOptional: true },
        { name: "notes", type: "string", isOptional: true },
        { name: "date", type: "number" }, // timestamp
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),

    // ===========================================
    // BUDGETS
    // ===========================================
    tableSchema({
      name: "budgets",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // CATEGORY, GLOBAL
        {
          name: "category_id",
          type: "string",
          isOptional: true,
          isIndexed: true,
        },
        { name: "amount", type: "number" },
        { name: "currency", type: "string" }, // EGP, USD, EUR
        { name: "period", type: "string" }, // WEEKLY, MONTHLY, CUSTOM
        { name: "period_start", type: "number", isOptional: true }, // timestamp
        { name: "period_end", type: "number", isOptional: true }, // timestamp
        { name: "alert_threshold", type: "number" }, // 1-100
        { name: "status", type: "string" }, // ACTIVE, PAUSED
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted", type: "boolean" },
      ],
    }),
  ],
});
