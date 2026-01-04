/**
 * UserCategorySettings Model for WatermelonDB
 * Per-user settings for system categories
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
import type { Category } from "./Category";
import type { CategoryNature } from "../types";

export class UserCategorySettings extends Model {
  static table = "user_category_settings";
  static associations: Associations = {
    categories: { type: "belongs_to", key: "category_id" },
  };

  @field("user_id") userId!: string;
  @field("category_id") categoryId!: string;
  @field("is_hidden") isHidden!: boolean;
  @field("nature") nature?: CategoryNature;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("categories", "category_id") category!: Relation<Category>;
}
