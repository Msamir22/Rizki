/**
 * Core types for Astik application
 */

import { SupabaseDatabase } from "@astik/db";

export enum Currency {
  EGP = "EGP",
  USD = "USD",
  EUR = "EUR",
}

export type GoldKarat = 24 | 22 | 21 | 18 | 14 | 10;

export type MarketRates =
  | SupabaseDatabase["public"]["Tables"]["market_rates"]["Row"]
  | null;

export interface ParsedVoiceTransaction {
  amount: number;
  currency: Currency;
  merchant?: string;
  description?: string;
  detectedCategory?: string | null;
  confidence: number; // 0-1, for category detection
  isIncome?: boolean;
  detectedLanguage?: "ar" | "en";
}

export interface ParsedNotification {
  type: "EXPENSE" | "INCOME";
  amount: number;
  currency: Currency;
  merchant?: string;
  description: string;

  // Account matching data
  cardLast4?: string;
  accountNumber?: string;
  bankIdentifier?: string;

  // Balance sync
  availableBalance?: number;

  // Reference tracking
  reference?: string;

  // Auto-detected category
  detectedCategory?: string | null;
}
