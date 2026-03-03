/**
 * Pending Account Service
 *
 * Manages in-memory accounts created during the SMS review session.
 * These accounts are NOT persisted to WatermelonDB until the user
 * taps "Save All" on the review page.
 *
 * Architecture & Design Rationale:
 * - Pattern: Unit of Work — accumulates pending changes in memory,
 *   then commits them atomically in a single WatermelonDB batch write.
 * - Why: Avoids premature persistence of accounts the user might
 *   discard. Only referenced accounts are persisted on final save.
 * - SOLID: SRP — only handles pending account lifecycle.
 *   ISP — consumers only need `PendingAccount` (read) or
 *   `persistPendingAccounts` (write), not both.
 *
 * @module pending-account-service
 */

import {
  database,
  type Account,
  type BankDetails,
  type CurrencyType,
} from "@astik/db";
import { getCurrentUserId } from "./supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * In-memory account created during the review session.
 * Not persisted until final save — see `persistPendingAccounts`.
 */
interface PendingAccount {
  /** Temporary UUID generated client-side */
  readonly tempId: string;
  /** User-entered account name */
  readonly name: string;
  /** Currency inherited from the transaction */
  readonly currency: CurrencyType;
  /** Always BANK for SMS-created accounts */
  readonly type: "BANK";
  /** SMS sender address (for bank_details.sms_sender_name) */
  readonly senderAddress: string;
  /** Card last 4 digits from SMS body (for bank_details.card_last_4) */
  readonly cardLast4?: string;
}

/**
 * Result of persisting pending accounts to WatermelonDB.
 */
interface PersistResult {
  /** Maps PendingAccount.tempId → real WatermelonDB Account.id */
  readonly tempToRealIdMap: ReadonlyMap<string, string>;
  /** Number of accounts + bank_details created */
  readonly createdCount: number;
  /** Errors encountered during creation */
  readonly errors: readonly string[];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Persist pending accounts to WatermelonDB in a single atomic batch.
 *
 * For each `PendingAccount`:
 * 1. Creates an `Account` record (type=BANK, with user's currency)
 * 2. Creates a `BankDetails` record (sms_sender_name + card_last_4)
 *
 * Only accounts referenced by at least one transaction should be
 * passed here — the caller filters unreferenced accounts first.
 *
 * @param pendingAccounts - Filtered list of referenced pending accounts
 * @returns Map of tempId → realId, plus count and error details
 */
async function persistPendingAccounts(
  pendingAccounts: readonly PendingAccount[]
): Promise<PersistResult> {
  if (pendingAccounts.length === 0) {
    return {
      tempToRealIdMap: new Map(),
      createdCount: 0,
      errors: [],
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      tempToRealIdMap: new Map(),
      createdCount: 0,
      errors: ["No authenticated user — cannot persist accounts"],
    };
  }

  const tempToRealIdMap = new Map<string, string>();
  const errors: string[] = [];
  let createdCount = 0;

  try {
    await database.write(async () => {
      for (const pending of pendingAccounts) {
        try {
          // Create Account record
          const account = await database
            .get<Account>("accounts")
            .create((record) => {
              record.userId = userId;
              record.name = pending.name;
              record.currency = pending.currency;
              record.type = pending.type;
              record.balance = 0;
              record.isDefault = false;
            });

          // Create BankDetails record
          await database.get<BankDetails>("bank_details").create((record) => {
            record.accountId = account.id;
            record.smsSenderName = pending.senderAddress;
            if (pending.cardLast4) {
              record.cardLast4 = pending.cardLast4;
            }
          });

          tempToRealIdMap.set(pending.tempId, account.id);
          createdCount++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`Failed to create account "${pending.name}": ${message}`);
        }
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Batch write failed: ${message}`);
  }

  return { tempToRealIdMap, createdCount, errors };
}

export { persistPendingAccounts };
export type { PendingAccount, PersistResult };
