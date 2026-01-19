-- ============================================================================
-- MIGRATE USER DATA SCRIPT
-- ============================================================================
-- This script migrates all user data from one user_id to another.
-- Useful when you need to transfer data to a new anonymous session.
--
-- USAGE:
-- 1. Replace OLD_USER_ID and NEW_USER_ID with the actual UUIDs
-- 2. Run in Supabase SQL Editor or via psql
-- 
-- IMPORTANT: Run this in a transaction to ensure atomicity
-- ============================================================================

-- ============================================================================
-- CONFIGURATION - UPDATE THESE VALUES
-- ============================================================================
DO $$
DECLARE
    old_user_id UUID := 'e08ecc79-4043-46a1-a354-58b49be17352';  -- Replace with source user ID
    new_user_id UUID := '4462ba59-75c8-4e9b-bdf8-79cc3f7fba98';  -- Replace with target user ID
    affected_rows INTEGER;
    total_affected INTEGER := 0;
BEGIN
    -- ========================================================================
    -- CORE USER DATA TABLES (with direct user_id column)
    -- ========================================================================

    -- 1. Accounts
    UPDATE accounts SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'accounts: % rows updated', affected_rows;

    -- 2. Assets
    UPDATE assets SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'assets: % rows updated', affected_rows;

    -- 3. Budgets
    UPDATE budgets SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'budgets: % rows updated', affected_rows;

    -- 4. Categories (user-created categories only, not system categories)
    UPDATE categories SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'categories: % rows updated', affected_rows;

    -- 5. Debts
    UPDATE debts SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'debts: % rows updated', affected_rows;

    -- 6. Profiles (has unique constraint on user_id)
    -- First, delete the new user's empty profile (if exists)
    DELETE FROM profiles WHERE user_id = new_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows > 0 THEN
        RAISE NOTICE 'profiles: deleted % existing profile(s) for new user', affected_rows;
    END IF;
    -- Now migrate the old user's profile
    UPDATE profiles SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'profiles: % rows updated', affected_rows;

    -- 7. Recurring Payments
    UPDATE recurring_payments SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'recurring_payments: % rows updated', affected_rows;

    -- 8. Transactions
    UPDATE transactions SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'transactions: % rows updated', affected_rows;

    -- 9. Transfers
    UPDATE transfers SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'transfers: % rows updated', affected_rows;

    -- 10. User Category Settings
    UPDATE user_category_settings SET user_id = new_user_id, updated_at = NOW() 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'user_category_settings: % rows updated', affected_rows;

    -- ========================================================================
    -- SNAPSHOT TABLES (historical data)
    -- ========================================================================

    -- 11. Daily Snapshot - Assets
    UPDATE daily_snapshot_assets SET user_id = new_user_id 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'daily_snapshot_assets: % rows updated', affected_rows;

    -- 12. Daily Snapshot - Balance
    UPDATE daily_snapshot_balance SET user_id = new_user_id 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'daily_snapshot_balance: % rows updated', affected_rows;

    -- 13. Daily Snapshot - Net Worth
    UPDATE daily_snapshot_net_worth SET user_id = new_user_id 
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    RAISE NOTICE 'daily_snapshot_net_worth: % rows updated', affected_rows;

    -- ========================================================================
    -- SUMMARY
    -- ========================================================================
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION COMPLETE';
    RAISE NOTICE 'Total rows migrated: %', total_affected;
    RAISE NOTICE 'From user: %', old_user_id;
    RAISE NOTICE 'To user: %', new_user_id;
    RAISE NOTICE '============================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES (run separately to verify migration)
-- ============================================================================
-- Uncomment and run these after migration to verify:

-- SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts WHERE user_id = '8b9b2459-b595-4b0b-af41-4447d74a8771'
-- UNION ALL
-- SELECT 'assets', COUNT(*) FROM assets WHERE user_id = '8b9b2459-b595-4b0b-af41-4447d74a8771'
-- UNION ALL
-- SELECT 'transactions', COUNT(*) FROM transactions WHERE user_id = '8b9b2459-b595-4b0b-af41-4447d74a8771'
-- UNION ALL
-- SELECT 'profiles', COUNT(*) FROM profiles WHERE user_id = '8b9b2459-b595-4b0b-af41-4447d74a8771';
