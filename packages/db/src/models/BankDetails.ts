/**
 * BankDetails Model for WatermelonDB
 * Bank-specific details for accounts with type=BANK
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

export class BankDetails extends Model {
  static table = "bank_details";
  static associations: Associations = {
    accounts: { type: "belongs_to", key: "account_id" },
  };

  @field("account_id") accountId!: string;
  @field("bank_name") bankName!: string;
  @field("card_last_4") cardLast4!: string;
  @field("sms_sender_name") smsSenderName?: string;
  @field("account_number") accountNumber?: string;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("accounts", "account_id") account!: Relation<Account>;
}
