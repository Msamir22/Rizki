/**
 * AssetMetal Model for WatermelonDB
 * Metal-specific details for assets with type=METAL
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
import type { Asset } from "./Asset";
import type { MetalType } from "../types";

export class AssetMetal extends Model {
  static table = "asset_metals";
  static associations: Associations = {
    assets: { type: "belongs_to", key: "asset_id" },
  };

  @field("asset_id") assetId!: string;
  @field("metal_type") metalType!: MetalType;
  @field("weight_grams") weightGrams!: number;
  @field("purity_karat") purityKarat!: number;
  @field("item_form") itemForm?: string;

  @readonly @date("created_at") createdAt!: Date;

  @relation("assets", "asset_id") asset!: Relation<Asset>;

  /**
   * Calculate current value based on live gold price
   * @param goldPricePerGram - Live gold price per gram (for 24K)
   * @returns Current value in the same currency as the price
   */
  calculateValue(goldPricePerGram: number): number {
    return this.weightGrams * (this.purityKarat / 24) * goldPricePerGram;
  }
}
