import { BaseBudget } from "./base/base-budget";

export class Budget extends BaseBudget {
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
