/**
 * BaseAssetMetal - Abstract Base Model for WatermelonDB
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 *
 * Extend this class in ../AssetMetal.ts to add custom methods
 */

import { Model, type Relation } from "@nozbe/watermelondb";
import {
  date,
  field,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { MetalType } from "../../types";
import type { BaseAsset } from "./base-asset";

export abstract class BaseAssetMetal extends Model {
  static table = "asset_metals";
  static associations: Associations = {
    assets: { type: "belongs_to", key: "asset_id" },
  };

  @field("asset_id") assetId!: string;
  @readonly @date("created_at") createdAt!: Date;
  @field("deleted") deleted!: boolean;
  @field("item_form") itemForm?: string;
  @field("metal_type") metalType!: MetalType;
  @field("purity_fraction") purityFraction!: number;
  @date("updated_at") updatedAt!: Date;
  @field("weight_grams") weightGrams!: number;

  @relation("assets", "asset_id") asset!: Relation<BaseAsset>;
}
