/**
 * RecurringPayment Model for WatermelonDB
 * Scheduled recurring transactions
 */

import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  readonly,
  date,
  relation,
  children,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { Relation } from "@nozbe/watermelondb";
import type { Account } from "./Account";
import type { Category } from "./Category";
import type { Debt } from "./Debt";
import type {
  RecurringFrequency,
  RecurringAction,
  RecurringStatus,
  TransactionType,
} from "../types";

export class RecurringPayment extends Model {
  static table = "recurring_payments";
  static associations: Associations = {
    accounts: { type: "belongs_to", key: "account_id" },
    categories: { type: "belongs_to", key: "category_id" },
    debts: { type: "belongs_to", key: "linked_debt_id" },
    transactions: { type: "has_many", foreignKey: "linked_recurring_id" },
  };

  @field("user_id") userId!: string;
  @field("name") name!: string;
  @field("amount") amount!: number;
  @field("type") type!: TransactionType;
  @field("category_id") categoryId!: string;
  @field("account_id") accountId!: string;
  @field("frequency") frequency!: RecurringFrequency;
  @field("frequency_value") frequencyValue?: number;
  @date("start_date") startDate!: Date;
  @date("end_date") endDate?: Date;
  @date("next_due_date") nextDueDate!: Date;
  @field("action") action!: RecurringAction;
  @field("status") status!: RecurringStatus;
  @field("linked_debt_id") linkedDebtId?: string;
  @field("notes") notes?: string;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("accounts", "account_id") account!: Relation<Account>;
  @relation("categories", "category_id") category!: Relation<Category>;
  @relation("debts", "linked_debt_id") linkedDebt?: Relation<Debt>;
  @children("transactions") transactions!: Query<Model>;

  get isActive(): boolean {
    return this.status === "ACTIVE";
  }

  get isExpense(): boolean {
    return this.type === "EXPENSE";
  }

  get shouldAutoCreate(): boolean {
    return this.action === "AUTO_CREATE";
  }

  get isDue(): boolean {
    return this.nextDueDate <= new Date();
  }
}
