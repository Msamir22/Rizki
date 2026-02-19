-- =============================================================================
-- Migration 024: Drop Account Balance Triggers
-- Description: Removes the automatic balance recalculation triggers from the
--              transactions table. Balance management is now handled entirely
--              by the application layer (delta-based updates in WatermelonDB).
--
-- Rationale: The triggers caused a double-counting conflict during sync:
--            when a transaction INSERT arrived before its corresponding
--            account UPDATE, the trigger would SUM() all transactions
--            (ignoring initial balance / manual adjustments) and overwrite
--            the correct balance pushed moments later.
--
-- Kept as manual utilities:
--   - recalculate_account_balance(account_id_param UUID)
--   - recalculate_all_account_balances()
-- =============================================================================

-- Drop all three triggers on the transactions table
DROP TRIGGER IF EXISTS trg_transactions_balance_insert ON public.transactions;
DROP TRIGGER IF EXISTS trg_transactions_balance_update ON public.transactions;
DROP TRIGGER IF EXISTS trg_transactions_balance_delete ON public.transactions;

-- Drop the trigger function (no longer needed)
DROP FUNCTION IF EXISTS public.update_account_balance_on_transaction_change();

-- NOTE: The following functions are intentionally KEPT as manual repair tools:
--   public.recalculate_account_balance(account_id_param UUID)
--   public.recalculate_all_account_balances()
