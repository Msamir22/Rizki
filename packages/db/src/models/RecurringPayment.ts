import { BaseRecurringPayment } from "./base/base-recurring-payment";

export class RecurringPayment extends BaseRecurringPayment {
  get isActive(): boolean {
    return this.status === "ACTIVE";
  }

  get isExpense(): boolean {
    return this.type === "EXPENSE";
  }

  get shouldAutoCreate(): boolean {
    return this.action === "AUTO_CREATE";
  }

  get isDue(): boolean {
    return this.nextDueDate <= new Date();
  }
}
