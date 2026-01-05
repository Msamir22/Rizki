import { BaseCategory } from "./base/base-category";

export class Category extends BaseCategory {
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
