/**
 * BaseUserCategorySettings - Abstract Base Model for WatermelonDB
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 *
 * Extend this class in ../UserCategorySettings.ts to add custom methods
 */

import type { Relation } from "@nozbe/watermelondb";
import { Model } from "@nozbe/watermelondb";
import {
  date,
  field,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { CategoryNature } from "../../types";
import type { BaseCategory } from "./base-category";

export abstract class BaseUserCategorySettings extends Model {
  static table = "user_category_settings";
  static associations: Associations = {
    categories: { type: "belongs_to", key: "category_id" },
  };

  @field("category_id") categoryId!: string;
  @readonly @date("created_at") createdAt!: Date;
  @field("is_hidden") isHidden!: boolean;
  @field("nature") nature?: CategoryNature;
  @date("updated_at") updatedAt!: Date;
  @field("user_id") userId!: string;

  @relation("categories", "category_id") category!: Relation<BaseCategory>;
}
