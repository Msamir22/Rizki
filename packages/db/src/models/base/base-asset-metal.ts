/**
 * BaseAssetMetal - Abstract Base Model for WatermelonDB
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 * 
 * Extend this class in ../AssetMetal.ts to add custom methods
 */

import { Model, Query } from "@nozbe/watermelondb";
import { field, date, readonly, relation } from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { Relation } from "@nozbe/watermelondb";
import type { MetalType } from "../../types";
import type { BaseAsset } from "./base-asset";

export abstract class BaseAssetMetal extends Model {
  static table = "asset_metals";
  static associations: Associations = {
    assets: { type: "belongs_to", key: "asset_id" },
  };

  @field("asset_id") assetId!: string;
  @readonly @date("created_at") createdAt!: Date;
  @field("item_form") itemForm?: string;
  @field("metal_type") metalType!: MetalType;
  @field("purity_karat") purityKarat!: number;
  @field("weight_grams") weightGrams!: number;

  @relation("assets", "asset_id") asset!: Relation<BaseAsset>;
}
