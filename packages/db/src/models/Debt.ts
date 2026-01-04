/**
 * Debt Model for WatermelonDB
 * Money lent to or borrowed from others
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
import type { DebtType, DebtStatus } from "../types";

export class Debt extends Model {
  static table = "debts";
  static associations: Associations = {
    accounts: { type: "belongs_to", key: "account_id" },
    transactions: { type: "has_many", foreignKey: "linked_debt_id" },
    recurring_payments: { type: "has_many", foreignKey: "linked_debt_id" },
  };

  @field("user_id") userId!: string;
  @field("type") type!: DebtType;
  @field("party_name") partyName!: string;
  @field("original_amount") originalAmount!: number;
  @field("outstanding_amount") outstandingAmount!: number;
  @field("account_id") accountId!: string;
  @field("notes") notes?: string;
  @date("date") date!: Date;
  @date("due_date") dueDate?: Date;
  @field("status") status!: DebtStatus;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("accounts", "account_id") account!: Relation<Account>;
  @children("transactions") transactions!: Query<Model>;
  @children("recurring_payments") recurringPayments!: Query<Model>;

  get isLent(): boolean {
    return this.type === "LENT";
  }

  get isBorrowed(): boolean {
    return this.type === "BORROWED";
  }

  get isSettled(): boolean {
    return this.status === "SETTLED";
  }

  get paidAmount(): number {
    return this.originalAmount - this.outstandingAmount;
  }

  get paidPercentage(): number {
    if (this.originalAmount === 0) return 0;
    return (this.paidAmount / this.originalAmount) * 100;
  }
}
