/**
 * Transfer Model for WatermelonDB
 * Transfers between user's own accounts
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
import type { Currency } from "../types";

export class Transfer extends Model {
  static table = "transfers";
  static associations: Associations = {
    from_account: { type: "belongs_to", key: "from_account_id" },
    to_account: { type: "belongs_to", key: "to_account_id" },
  };

  @field("user_id") userId!: string;
  @field("from_account_id") fromAccountId!: string;
  @field("to_account_id") toAccountId!: string;
  @field("amount") amount!: number;
  @field("currency") currency!: Currency;
  @field("exchange_rate") exchangeRate?: number;
  @field("converted_amount") convertedAmount?: number;
  @field("notes") notes?: string;
  @date("date") date!: Date;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("accounts", "from_account_id") fromAccount!: Relation<Account>;
  @relation("accounts", "to_account_id") toAccount!: Relation<Account>;

  get isCrossCurrency(): boolean {
    return this.exchangeRate !== undefined && this.exchangeRate !== null;
  }

  get destinationAmount(): number {
    return this.convertedAmount ?? this.amount;
  }
}
