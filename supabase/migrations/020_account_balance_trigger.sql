-- =============================================================================
-- Migration 020: Account Balance Trigger
-- Description: Automatically recalculate account balance when transactions change
-- Approach: Hybrid - Supabase trigger + local manual updates for responsiveness
-- =============================================================================

-- =============================================================================
-- SECTION 1: FUNCTION TO RECALCULATE ACCOUNT BALANCE
-- =============================================================================

-- Function that recalculates an account's balance based on all its transactions
CREATE OR REPLACE FUNCTION public.recalculate_account_balance(account_id_param UUID)
RETURNS DECIMAL(15, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_balance DECIMAL(15, 2);
BEGIN
  -- Calculate balance by summing transactions
  -- Income adds to balance, Expenses subtract
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'INCOME' THEN amount
      WHEN type = 'EXPENSE' THEN -amount
      ELSE 0
    END
  ), 0)
  INTO calculated_balance
  FROM public.transactions
  WHERE account_id = account_id_param
    AND deleted = false;
  
  -- Note: We don't update the account directly here to avoid recursion
  -- The trigger function will handle the update
  
  RETURN calculated_balance;
END;
$$;

COMMENT ON FUNCTION public.recalculate_account_balance IS 'Calculates the balance for an account by summing all non-deleted transactions';

-- =============================================================================
-- SECTION 2: TRIGGER FUNCTION FOR TRANSACTION CHANGES
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_account_id UUID;
  new_balance DECIMAL(15, 2);
BEGIN
  -- Determine which account to update based on operation type
  IF TG_OP = 'DELETE' THEN
    affected_account_id := OLD.account_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If account_id changed, we need to update both old and new accounts
    IF OLD.account_id != NEW.account_id THEN
      -- First update the old account
      new_balance := public.recalculate_account_balance(OLD.account_id);
      UPDATE public.accounts 
      SET balance = new_balance, updated_at = NOW()
      WHERE id = OLD.account_id;
    END IF;
    affected_account_id := NEW.account_id;
  ELSE -- INSERT
    affected_account_id := NEW.account_id;
  END IF;
  
  -- Recalculate and update the affected account's balance
  new_balance := public.recalculate_account_balance(affected_account_id);
  
  UPDATE public.accounts 
  SET balance = new_balance, updated_at = NOW()
  WHERE id = affected_account_id;
  
  -- Return appropriate row based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.update_account_balance_on_transaction_change IS 
  'Trigger function that recalculates account balance whenever transactions are modified';

-- =============================================================================
-- SECTION 3: CREATE TRIGGERS ON TRANSACTIONS TABLE
-- =============================================================================

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS trg_transactions_balance_insert ON public.transactions;
DROP TRIGGER IF EXISTS trg_transactions_balance_update ON public.transactions;
DROP TRIGGER IF EXISTS trg_transactions_balance_delete ON public.transactions;

-- Trigger for INSERT - recalculate balance when new transaction is added
CREATE TRIGGER trg_transactions_balance_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_transaction_change();

-- Trigger for UPDATE - recalculate when transaction is modified (amount, type, account, deleted flag)
CREATE TRIGGER trg_transactions_balance_update
  AFTER UPDATE OF amount, type, account_id, deleted ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_transaction_change();

-- Trigger for DELETE - recalculate when transaction is hard deleted
CREATE TRIGGER trg_transactions_balance_delete
  AFTER DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_transaction_change();

-- =============================================================================
-- SECTION 4: UTILITY FUNCTION TO RECALCULATE ALL ACCOUNT BALANCES
-- =============================================================================

-- One-time function to recalculate all account balances (can be run manually if needed)
CREATE OR REPLACE FUNCTION public.recalculate_all_account_balances()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  new_balance DECIMAL(15, 2);
  update_count INTEGER := 0;
BEGIN
  FOR account_record IN SELECT id FROM public.accounts WHERE deleted = false LOOP
    new_balance := public.recalculate_account_balance(account_record.id);
    
    UPDATE public.accounts 
    SET balance = new_balance, updated_at = NOW()
    WHERE id = account_record.id;
    
    update_count := update_count + 1;
  END LOOP;
  
  RETURN update_count;
END;
$$;

COMMENT ON FUNCTION public.recalculate_all_account_balances IS 
  'Utility function to recalculate balances for all accounts. Run manually if database gets out of sync.';

-- =============================================================================
-- SECTION 5: RUN INITIAL RECALCULATION
-- =============================================================================

-- Recalculate all balances to ensure consistency
SELECT public.recalculate_all_account_balances();
