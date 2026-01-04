/**
 * Asset Model for WatermelonDB
 * Wealth tracking (metals, crypto, real estate)
 */

import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  readonly,
  date,
  children,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { AssetType, Currency } from "../types";

export class Asset extends Model {
  static table = "assets";
  static associations: Associations = {
    asset_metals: { type: "has_many", foreignKey: "asset_id" },
    transactions: { type: "has_many", foreignKey: "linked_asset_id" },
  };

  @field("user_id") userId!: string;
  @field("name") name!: string;
  @field("type") type!: AssetType;
  @field("is_liquid") isLiquid!: boolean;
  @field("purchase_price") purchasePrice!: number;
  @date("purchase_date") purchaseDate!: Date;
  @field("currency") currency!: Currency;
  @field("notes") notes?: string;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("asset_metals") assetMetals!: Query<Model>;
}
