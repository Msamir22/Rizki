-- =============================================================================
-- Migration 014: Standardize Snapshot Tables
-- Description: Add snapshot_date column to all remaining snapshot tables
--              for consistent date-based querying and uniqueness constraints
-- =============================================================================

-- =============================================================================
-- SECTION 1: Add snapshot_date to daily_snapshot_balance
-- =============================================================================

-- 1.1 Add snapshot_date column
ALTER TABLE public.daily_snapshot_balance
  ADD COLUMN IF NOT EXISTS snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 1.2 Add composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_snapshot_balance_user_date
  ON public.daily_snapshot_balance (user_id, snapshot_date);

-- 1.3 Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_snapshot_balance_snapshot_date
  ON public.daily_snapshot_balance (snapshot_date DESC);

-- =============================================================================
-- SECTION 2: Add snapshot_date to daily_snapshot_assets
-- =============================================================================

-- 2.1 Add snapshot_date column
ALTER TABLE public.daily_snapshot_assets
  ADD COLUMN IF NOT EXISTS snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 2.2 Add composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_snapshot_assets_user_date
  ON public.daily_snapshot_assets (user_id, snapshot_date);

-- 2.3 Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_snapshot_assets_snapshot_date
  ON public.daily_snapshot_assets (snapshot_date DESC);

-- =============================================================================
-- SECTION 3: Add snapshot_date to daily_snapshot_market_rates
-- =============================================================================

-- 3.1 Add snapshot_date column
ALTER TABLE public.daily_snapshot_market_rates
  ADD COLUMN IF NOT EXISTS snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 3.2 Add unique constraint on snapshot_date (only one rate snapshot per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_snapshot_market_rates_date
  ON public.daily_snapshot_market_rates (snapshot_date);

-- =============================================================================
-- SECTION 4: Update recalculate_daily_snapshot_balance function
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

  INSERT INTO public.daily_snapshot_balance (user_id, total_accounts_egp, breakdown, snapshot_date, created_at)
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
    jsonb_agg(
      jsonb_build_object(
        'account_id', a.id,
        'name', a.name,
        'balance', a.balance,
        'currency', a.currency,
        'balance_egp', CASE a.currency
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
        ELSE a.balance
        END
      )
    ),
    today,
    NOW()
  FROM public.accounts a
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY created_at DESC LIMIT 1) r
  WHERE a.deleted = false
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 5: Update recalculate_daily_snapshot_assets function
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

  INSERT INTO public.daily_snapshot_assets (user_id, total_assets_egp, breakdown, snapshot_date, created_at)
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
    jsonb_agg(
      jsonb_build_object(
        'asset_id', a.id,
        'name', a.name,
        'metal_type', am.metal_type,
        'weight_grams', am.weight_grams,
        'purity_fraction', am.purity_fraction,
        'value_egp', am.weight_grams * am.purity_fraction * 
          CASE am.metal_type 
            WHEN 'GOLD' THEN r.gold_egp_per_gram
            WHEN 'SILVER' THEN r.silver_egp_per_gram
            WHEN 'PLATINUM' THEN r.platinum_egp_per_gram
            WHEN 'PALLADIUM' THEN r.palladium_egp_per_gram
            ELSE 0
          END
      )
    ),
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
-- SECTION 6: Update save_daily_market_rates_snapshot function
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
  DELETE FROM public.daily_snapshot_market_rates WHERE snapshot_date = today;

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
    snapshot_date,
    created_at
  )
  SELECT 
    gold_egp_per_gram, silver_egp_per_gram, platinum_egp_per_gram, palladium_egp_per_gram,
    usd_egp, eur_egp, gbp_egp,
    aed_egp, aud_egp, bhd_egp, btc_egp, cad_egp, chf_egp, cnh_egp, cny_egp,
    dkk_egp, dzd_egp, hkd_egp, inr_egp, iqd_egp, isk_egp, jod_egp, jpy_egp,
    kpw_egp, krw_egp, kwd_egp, lyd_egp, mad_egp, myr_egp, nok_egp, nzd_egp,
    omr_egp, qar_egp, rub_egp, sar_egp, sek_egp, sgd_egp, tnd_egp, try_egp, zar_egp,
    today,
    NOW()
  FROM public.market_rates
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- =============================================================================
-- SECTION 7: Update recalculate_daily_snapshot_net_worth to use snapshot_date
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
  -- Check if today's balance snapshots exist (using snapshot_date now)
  SELECT EXISTS(
    SELECT 1 FROM public.daily_snapshot_balance WHERE snapshot_date = today
  ) INTO balance_snapshots_exist;
  
  -- Check if today's asset snapshots exist (using snapshot_date now)
  SELECT EXISTS(
    SELECT 1 FROM public.daily_snapshot_assets WHERE snapshot_date = today
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
    WHERE snapshot_date = today
  ) b
  FULL OUTER JOIN (
    SELECT user_id, total_assets_egp 
    FROM public.daily_snapshot_assets 
    WHERE snapshot_date = today
  ) a ON b.user_id = a.user_id
  WHERE (COALESCE(b.total_accounts_egp, 0) + COALESCE(a.total_assets_egp, 0)) > 0;
END;
$$;

-- =============================================================================
-- SECTION 8: Comments
-- =============================================================================

COMMENT ON FUNCTION public.recalculate_daily_snapshot_balance IS 'Creates daily balance snapshots with snapshot_date for historical queries';
COMMENT ON FUNCTION public.recalculate_daily_snapshot_assets IS 'Creates daily asset snapshots with snapshot_date for historical queries';
COMMENT ON FUNCTION public.save_daily_market_rates_snapshot IS 'Saves market rates with snapshot_date to daily_snapshot_market_rates';
COMMENT ON FUNCTION public.recalculate_daily_snapshot_net_worth IS 'Creates daily net worth snapshots using snapshot_date from balance/asset snapshots';
