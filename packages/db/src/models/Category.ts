/**
 * Category Model for WatermelonDB
 * Transaction categories with 3-level hierarchy
 */

import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  readonly,
  date,
  children,
  relation,
} from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type { Relation } from "@nozbe/watermelondb";
import type { CategoryNature, TransactionType } from "../types";

export class Category extends Model {
  static table = "categories";
  static associations: Associations = {
    categories: { type: "belongs_to", key: "parent_id" },
    subcategories: { type: "has_many", foreignKey: "parent_id" },
    transactions: { type: "has_many", foreignKey: "category_id" },
    recurring_payments: { type: "has_many", foreignKey: "category_id" },
    budgets: { type: "has_many", foreignKey: "category_id" },
  };

  @field("user_id") userId?: string;
  @field("parent_id") parentId?: string;
  @field("system_name") systemName!: string;
  @field("display_name") displayName!: string;
  @field("icon") icon!: string;
  @field("level") level!: number; // 1, 2, or 3
  @field("nature") nature?: CategoryNature;
  @field("type") type?: TransactionType;
  @field("is_system") isSystem!: boolean;
  @field("is_hidden") isHidden!: boolean;
  @field("is_internal") isInternal!: boolean;
  @field("sort_order") sortOrder!: number;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("categories", "parent_id") parent?: Relation<Category>;
  @children("categories") subcategories!: Query<Category>;

  get isUserCategory(): boolean {
    return !this.isSystem && this.userId !== null;
  }

  get isExpense(): boolean {
    return this.type === "EXPENSE";
  }

  get isIncome(): boolean {
    return this.type === "INCOME";
  }
}
