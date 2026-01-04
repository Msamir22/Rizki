/**
 * Transaction Model for WatermelonDB
 * All financial transactions
 */

import { Model } from "@nozbe/watermelondb";
import {
  field,
  readonly,
  date,
  relation,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { Relation } from "@nozbe/watermelondb";
import type { Account } from "./Account";
import type { Asset } from "./Asset";
import type { Category } from "./Category";
import type { Debt } from "./Debt";
import type { RecurringPayment } from "./RecurringPayment";
import type { TransactionSource, TransactionType, Currency } from "../types";

export class Transaction extends Model {
  static table = "transactions";
  static associations: Associations = {
    accounts: { type: "belongs_to", key: "account_id" },
    categories: { type: "belongs_to", key: "category_id" },
    assets: { type: "belongs_to", key: "linked_asset_id" },
    debts: { type: "belongs_to", key: "linked_debt_id" },
    recurring_payments: { type: "belongs_to", key: "linked_recurring_id" },
  };

  @field("user_id") userId!: string;
  @field("account_id") accountId!: string;
  @field("amount") amount!: number;
  @field("currency") currency!: Currency;
  @field("type") type!: TransactionType;
  @field("category_id") categoryId!: string;
  @field("merchant") merchant?: string;
  @field("note") note?: string;
  @date("date") date!: Date;
  @field("source") source!: TransactionSource;
  @field("is_draft") isDraft!: boolean;
  @field("linked_debt_id") linkedDebtId?: string;
  @field("linked_asset_id") linkedAssetId?: string;
  @field("linked_recurring_id") linkedRecurringId?: string;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("accounts", "account_id") account!: Relation<Account>;
  @relation("categories", "category_id") category!: Relation<Category>;
  @relation("assets", "linked_asset_id") linkedAsset?: Relation<Asset>;
  @relation("debts", "linked_debt_id") linkedDebt?: Relation<Debt>;
  @relation("recurring_payments", "linked_recurring_id")
  linkedRecurring?: Relation<RecurringPayment>;

  get isExpense(): boolean {
    return this.type === "EXPENSE";
  }

  get isIncome(): boolean {
    return this.type === "INCOME";
  }

  get isFromVoice(): boolean {
    return this.source === "VOICE";
  }

  get isFromSMS(): boolean {
    return this.source === "SMS";
  }

  get isAutoCreated(): boolean {
    return this.source === "RECURRING";
  }

  get hasLinkedDebt(): boolean {
    return this.linkedDebtId !== undefined && this.linkedDebtId !== null;
  }

  get hasLinkedAsset(): boolean {
    return this.linkedAssetId !== undefined && this.linkedAssetId !== null;
  }
}
