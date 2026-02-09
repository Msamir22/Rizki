import { formatCurrency } from "@astik/logic";
import { BaseAccount } from "./base/base-account";

export class Account extends BaseAccount {
  get formattedBalance(): string {
    return formatCurrency({
      amount: this.balance,
      currency: this.currency,
    });
  }
}
