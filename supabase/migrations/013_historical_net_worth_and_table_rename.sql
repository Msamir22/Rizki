-- =============================================================================
-- Migration 013: Historical Net Worth Snapshots & Table Rename
-- Description: Modify daily_snapshot_net_worth to store historical data,
--              rename daily_market_rates_snapshot for naming consistency
-- =============================================================================

-- =============================================================================
-- SECTION 1: MODIFY daily_snapshot_net_worth FOR HISTORICAL DATA
-- =============================================================================

-- 1.1 Drop the existing unique constraint on user_id
ALTER TABLE public.daily_snapshot_net_worth
  DROP CONSTRAINT IF EXISTS user_net_worth_summary_user_id_key;

-- Also try the renamed constraint name (after table was renamed)
ALTER TABLE public.daily_snapshot_net_worth
  DROP CONSTRAINT IF EXISTS daily_snapshot_net_worth_user_id_key;

-- 1.2 Add snapshot_date column for efficient date-based uniqueness
ALTER TABLE public.daily_snapshot_net_worth
  ADD COLUMN IF NOT EXISTS snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 1.3 Add composite unique constraint for one snapshot per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_snapshot_net_worth_user_date
  ON public.daily_snapshot_net_worth (user_id, snapshot_date);

-- 1.4 Add index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_snapshot_net_worth_created
  ON public.daily_snapshot_net_worth (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_snapshot_net_worth_snapshot_date
  ON public.daily_snapshot_net_worth (snapshot_date DESC);

-- =============================================================================
-- SECTION 2: UPDATE recalculate_daily_snapshot_net_worth FUNCTION
-- Use delete+insert pattern with snapshot_date
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_daily_snapshot_net_worth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  balance_snapshots_exist BOOLEAN;
  asset_snapshots_exist BOOLEAN;
BEGIN
  -- Check if today's balance snapshots exist
  SELECT EXISTS(
    SELECT 1 FROM public.daily_snapshot_balance WHERE DATE(created_at) = today
  ) INTO balance_snapshots_exist;
  
  -- Check if today's asset snapshots exist
  SELECT EXISTS(
    SELECT 1 FROM public.daily_snapshot_assets WHERE DATE(created_at) = today
  ) INTO asset_snapshots_exist;

  -- We can proceed even if only one type exists (user might not have assets)
  IF NOT balance_snapshots_exist AND NOT asset_snapshots_exist THEN
    RAISE NOTICE 'Skipping net worth snapshot: no balance or asset snapshots for today';
    RETURN;
  END IF;

  -- Delete existing snapshot for today (to handle re-runs)
  DELETE FROM public.daily_snapshot_net_worth 
  WHERE snapshot_date = today;

  -- Insert new snapshot from today's balance and asset snapshots
  INSERT INTO public.daily_snapshot_net_worth (user_id, total_accounts, total_assets, total_net_worth, snapshot_date, created_at)
  SELECT 
    COALESCE(b.user_id, a.user_id) AS user_id,
    COALESCE(b.total_accounts_egp, 0)::DECIMAL(15, 2) AS total_accounts,
    COALESCE(a.total_assets_egp, 0)::DECIMAL(15, 2) AS total_assets,
    (COALESCE(b.total_accounts_egp, 0) + COALESCE(a.total_assets_egp, 0))::DECIMAL(15, 2) AS total_net_worth,
    today,
    NOW()
  FROM (
    SELECT user_id, total_accounts_egp 
    FROM public.daily_snapshot_balance 
    WHERE DATE(created_at) = today
  ) b
  FULL OUTER JOIN (
    SELECT user_id, total_assets_egp 
    FROM public.daily_snapshot_assets 
    WHERE DATE(created_at) = today
  ) a ON b.user_id = a.user_id
  WHERE (COALESCE(b.total_accounts_egp, 0) + COALESCE(a.total_assets_egp, 0)) > 0;
END;
$$;

-- =============================================================================
-- SECTION 3: RENAME daily_market_rates_snapshot FOR CONSISTENCY
-- =============================================================================

ALTER TABLE IF EXISTS public.daily_market_rates_snapshot
  RENAME TO daily_snapshot_market_rates;

COMMENT ON TABLE public.daily_snapshot_market_rates IS 'Daily snapshots of market rates for historical tracking';

-- Update index names to match new table name
ALTER INDEX IF EXISTS idx_daily_market_rates_snapshot_created
  RENAME TO idx_daily_snapshot_market_rates_created;

-- =============================================================================
-- SECTION 4: UPDATE save_daily_market_rates_snapshot FUNCTION
-- Use new table name
-- =============================================================================

CREATE OR REPLACE FUNCTION public.save_daily_market_rates_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  -- Delete existing snapshot for today (to handle re-runs)
  DELETE FROM public.daily_snapshot_market_rates WHERE DATE(created_at) = today;

  INSERT INTO public.daily_snapshot_market_rates (
    -- Base metals
    gold_egp_per_gram, silver_egp_per_gram, platinum_egp_per_gram, palladium_egp_per_gram,
    -- Base currencies
    usd_egp, eur_egp, gbp_egp,
    -- Other currencies
    aed_egp, aud_egp, bhd_egp, btc_egp, cad_egp, chf_egp, cnh_egp, cny_egp,
    dkk_egp, dzd_egp, hkd_egp, inr_egp, iqd_egp, isk_egp, jod_egp, jpy_egp,
    kpw_egp, krw_egp, kwd_egp, lyd_egp, mad_egp, myr_egp, nok_egp, nzd_egp,
    omr_egp, qar_egp, rub_egp, sar_egp, sek_egp, sgd_egp, tnd_egp, try_egp, zar_egp,
    -- Metadata
    created_at
  )
  SELECT 
    gold_egp_per_gram, silver_egp_per_gram, platinum_egp_per_gram, palladium_egp_per_gram,
    usd_egp, eur_egp, gbp_egp,
    aed_egp, aud_egp, bhd_egp, btc_egp, cad_egp, chf_egp, cnh_egp, cny_egp,
    dkk_egp, dzd_egp, hkd_egp, inr_egp, iqd_egp, isk_egp, jod_egp, jpy_egp,
    kpw_egp, krw_egp, kwd_egp, lyd_egp, mad_egp, myr_egp, nok_egp, nzd_egp,
    omr_egp, qar_egp, rub_egp, sar_egp, sek_egp, sgd_egp, tnd_egp, try_egp, zar_egp,
    NOW()
  FROM public.market_rates
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- =============================================================================
-- SECTION 5: UPDATE COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.recalculate_daily_snapshot_net_worth IS 'Creates daily net worth snapshots - stores historical data for trend analysis';
COMMENT ON FUNCTION public.save_daily_market_rates_snapshot IS 'Saves current market rates to daily_snapshot_market_rates table';
