/**
 * WatermelonDB Database Configuration
 * Complete database setup with all models
 */

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";

// Import all models
import { Profile } from "./models/Profile";
import { Account } from "./models/Account";
import { BankDetails } from "./models/BankDetails";
import { Asset } from "./models/Asset";
import { AssetMetal } from "./models/AssetMetal";
import { Category } from "./models/Category";
import { UserCategorySettings } from "./models/UserCategorySettings";
import { Debt } from "./models/Debt";
import { RecurringPayment } from "./models/RecurringPayment";
import { Transaction } from "./models/Transaction";
import { Transfer } from "./models/Transfer";
import { Budget } from "./models/Budget";

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => console.error("Database setup error:", error),
});

export const database = new Database({
  adapter,
  modelClasses: [
    Profile,
    Account,
    BankDetails,
    Asset,
    AssetMetal,
    Category,
    UserCategorySettings,
    Debt,
    RecurringPayment,
    Transaction,
    Transfer,
    Budget,
  ],
});

// Re-export models for convenience
export {
  Profile,
  Account,
  BankDetails,
  Asset,
  AssetMetal,
  Category,
  UserCategorySettings,
  Debt,
  RecurringPayment,
  Transaction,
  Transfer,
  Budget,
};
