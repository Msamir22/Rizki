/**
 * Budget Model for WatermelonDB
 * User budgets for spending limits
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
import type {
  Currency,
  BudgetType,
  BudgetPeriod,
  BudgetStatus,
} from "../types";

export class Budget extends Model {
  static table = "budgets";
  static associations: Associations = {
    categories: { type: "belongs_to", key: "category_id" },
  };

  @field("user_id") userId!: string;
  @field("name") name!: string;
  @field("type") type!: BudgetType;
  @field("category_id") categoryId?: string;
  @field("amount") amount!: number;
  @field("currency") currency!: Currency;
  @field("period") period!: BudgetPeriod;
  @date("period_start") periodStart?: Date;
  @date("period_end") periodEnd?: Date;
  @field("alert_threshold") alertThreshold!: number; // 1-100
  @field("status") status!: BudgetStatus;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("categories", "category_id") category?: Relation<Category>;

  get isActive(): boolean {
    return this.status === "ACTIVE";
  }

  get isGlobal(): boolean {
    return this.type === "GLOBAL";
  }

  get isCategoryBudget(): boolean {
    return this.type === "CATEGORY";
  }

  /**
   * Check if spending has hit the alert threshold
   * @param spent - Amount spent in this budget period
   * @returns true if alert should be triggered
   */
  shouldAlert(spent: number): boolean {
    const percentage = (spent / this.amount) * 100;
    return percentage >= this.alertThreshold;
  }

  /**
   * Calculate remaining budget
   * @param spent - Amount spent in this budget period
   * @returns Remaining amount
   */
  remaining(spent: number): number {
    return Math.max(0, this.amount - spent);
  }

  /**
   * Calculate spent percentage
   * @param spent - Amount spent in this budget period
   * @returns Percentage (0-100+)
   */
  spentPercentage(spent: number): number {
    if (this.amount === 0) return 0;
    return (spent / this.amount) * 100;
  }
}
