import { BaseDebt } from "./base/base-debt";

export class Debt extends BaseDebt {
  get isLent(): boolean {
    return this.type === "LENT";
  }

  get isBorrowed(): boolean {
    return this.type === "BORROWED";
  }

  get isSettled(): boolean {
    return this.status === "SETTLED";
  }

  get paidAmount(): number {
    return this.originalAmount - this.outstandingAmount;
  }

  get paidPercentage(): number {
    if (this.originalAmount === 0) return 0;
    return (this.paidAmount / this.originalAmount) * 100;
  }
}
