/**
 * Account Model for WatermelonDB
 * Liquid money containers (cash, bank, digital wallet)
 */

import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  readonly,
  date,
  children,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { AccountType, Currency } from "../types";

export class Account extends Model {
  static table = "accounts";
  static associations: Associations = {
    transactions: { type: "has_many", foreignKey: "account_id" },
    bank_details: { type: "has_many", foreignKey: "account_id" },
    debts: { type: "has_many", foreignKey: "account_id" },
    recurring_payments: { type: "has_many", foreignKey: "account_id" },
    transfers_from: { type: "has_many", foreignKey: "from_account_id" },
    transfers_to: { type: "has_many", foreignKey: "to_account_id" },
  };

  @field("user_id") userId!: string;
  @field("name") name!: string;
  @field("type") type!: AccountType;
  @field("balance") balance!: number;
  @field("currency") currency!: Currency;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("transactions") transactions!: Query<Model>;
  @children("bank_details") bankDetails!: Query<Model>;
}
