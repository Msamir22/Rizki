/**
 * BaseDebt - Abstract Base Model for WatermelonDB
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 *
 * Extend this class in ../Debt.ts to add custom methods
 */

import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  relation,
  children,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { Relation } from "@nozbe/watermelondb";
import type { DebtStatus, DebtType } from "../../types";
import type { BaseAccount } from "./base-account";

export abstract class BaseDebt extends Model {
  static table = "debts";
  static associations: Associations = {
    accounts: { type: "belongs_to", key: "account_id" },
    recurring_payments: { type: "has_many", foreignKey: "linked_debt_id" },
    transactions: { type: "has_many", foreignKey: "linked_debt_id" },
  };

  @field("account_id") accountId!: string;
  @readonly @date("created_at") createdAt!: Date;
  @date("date") date!: Date;
  @field("deleted") deleted!: boolean;
  @date("due_date") dueDate?: Date;
  @field("notes") notes?: string;
  @field("original_amount") originalAmount!: number;
  @field("outstanding_amount") outstandingAmount!: number;
  @field("party_name") partyName!: string;
  @field("status") status!: DebtStatus;
  @field("type") type!: DebtType;
  @date("updated_at") updatedAt!: Date;
  @field("user_id") userId!: string;

  @relation("accounts", "account_id") account!: Relation<BaseAccount>;
  @children("recurring_payments") recurringPayments!: Query<Model>;
  @children("transactions") transactions!: Query<Model>;
}
