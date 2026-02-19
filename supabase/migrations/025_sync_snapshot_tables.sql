-- =============================================================================
-- Migration 025: Sync Snapshot Tables Locally
-- Description: Prepare snapshot tables for WatermelonDB sync:
--   1. Drop unused 'breakdown' JSONB column from balance and assets tables
--   2. Add UNIQUE constraint on daily_snapshot_net_worth (user_id, snapshot_date)
--   3. Update cron functions to remove breakdown from INSERT statements
-- =============================================================================

-- =============================================================================
-- SECTION 1: Drop 'breakdown' column from daily_snapshot_balance
-- =============================================================================

ALTER TABLE public.daily_snapshot_balance
  DROP COLUMN IF EXISTS breakdown;

-- =============================================================================
-- SECTION 2: Drop 'breakdown' column from daily_snapshot_assets
-- =============================================================================

ALTER TABLE public.daily_snapshot_assets
  DROP COLUMN IF EXISTS breakdown;

-- =============================================================================
-- SECTION 3: Add UNIQUE constraint on daily_snapshot_net_worth
-- (balance and assets already have this from migration 014)
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_snapshot_net_worth_user_date
  ON public.daily_snapshot_net_worth (user_id, snapshot_date);

-- =============================================================================
-- SECTION 4: Update recalculate_daily_snapshot_balance (remove breakdown)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_daily_snapshot_balance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  rates_exist BOOLEAN;
BEGIN
  -- Check if market rates exist
  SELECT EXISTS(SELECT 1 FROM public.market_rates) INTO rates_exist;
  
  IF NOT rates_exist THEN
    RAISE NOTICE 'Skipping balance snapshot: no market rates available';
    RETURN;
  END IF;

  -- Delete existing snapshot for today (to handle re-runs)
  DELETE FROM public.daily_snapshot_balance 
  WHERE snapshot_date = today;

  INSERT INTO public.daily_snapshot_balance (user_id, total_accounts_egp, snapshot_date, created_at)
  SELECT 
    a.user_id,
    SUM(
      CASE a.currency
        WHEN 'EGP' THEN a.balance
        WHEN 'USD' THEN a.balance * r.usd_egp
        WHEN 'EUR' THEN a.balance * r.eur_egp
        WHEN 'GBP' THEN a.balance * r.gbp_egp
        WHEN 'AED' THEN a.balance * r.aed_egp
        WHEN 'SAR' THEN a.balance * r.sar_egp
        WHEN 'KWD' THEN a.balance * r.kwd_egp
        WHEN 'BHD' THEN a.balance * r.bhd_egp
        WHEN 'QAR' THEN a.balance * r.qar_egp
        WHEN 'OMR' THEN a.balance * r.omr_egp
        WHEN 'JOD' THEN a.balance * r.jod_egp
        WHEN 'AUD' THEN a.balance * r.aud_egp
        WHEN 'CAD' THEN a.balance * r.cad_egp
        WHEN 'CHF' THEN a.balance * r.chf_egp
        WHEN 'CNY' THEN a.balance * r.cny_egp
        WHEN 'JPY' THEN a.balance * r.jpy_egp
        WHEN 'INR' THEN a.balance * r.inr_egp
        WHEN 'TRY' THEN a.balance * r.try_egp
        WHEN 'RUB' THEN a.balance * r.rub_egp
        WHEN 'ZAR' THEN a.balance * r.zar_egp
        WHEN 'BTC' THEN a.balance * r.btc_egp
        ELSE a.balance -- Fallback for any unmapped currency
      END
    )::DECIMAL(15, 2),
    today,
    NOW()
  FROM public.accounts a
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY created_at DESC LIMIT 1) r
  WHERE a.deleted = false
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 5: Update recalculate_daily_snapshot_assets (remove breakdown)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_daily_snapshot_assets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  rates_exist BOOLEAN;
BEGIN
  -- Check if market rates exist
  SELECT EXISTS(SELECT 1 FROM public.market_rates) INTO rates_exist;
  
  IF NOT rates_exist THEN
    RAISE NOTICE 'Skipping assets snapshot: no market rates available';
    RETURN;
  END IF;

  -- Delete existing snapshot for today (to handle re-runs)
  DELETE FROM public.daily_snapshot_assets 
  WHERE snapshot_date = today;

  INSERT INTO public.daily_snapshot_assets (user_id, total_assets_egp, snapshot_date, created_at)
  SELECT 
    a.user_id,
    SUM(
      am.weight_grams * am.purity_fraction * 
      CASE am.metal_type 
        WHEN 'GOLD' THEN r.gold_egp_per_gram
        WHEN 'SILVER' THEN r.silver_egp_per_gram
        WHEN 'PLATINUM' THEN r.platinum_egp_per_gram
        WHEN 'PALLADIUM' THEN r.palladium_egp_per_gram
        ELSE 0
      END
    )::DECIMAL(15, 2),
    today,
    NOW()
  FROM public.assets a
  JOIN public.asset_metals am ON am.asset_id = a.id
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY created_at DESC LIMIT 1) r
  WHERE a.deleted = false AND a.type = 'METAL'
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 6: Comments
-- =============================================================================

COMMENT ON FUNCTION public.recalculate_daily_snapshot_balance IS 'Creates daily balance snapshots (breakdown column removed for sync efficiency)';
COMMENT ON FUNCTION public.recalculate_daily_snapshot_assets IS 'Creates daily asset snapshots (breakdown column removed for sync efficiency)';
