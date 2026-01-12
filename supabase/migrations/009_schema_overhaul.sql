-- =============================================================================
-- Migration 009: Schema Overhaul
-- Description: Comprehensive schema update with enums, expanded market rates,
--              standardized snapshot tables, and updated functions.
-- =============================================================================

-- =============================================================================
-- SECTION 1: DROP VIEW
-- =============================================================================

REVOKE SELECT ON public.v_user_net_worth FROM authenticated;
DROP VIEW IF EXISTS public.v_user_net_worth;

-- =============================================================================
-- SECTION 2: CREATE CURRENCY ENUM
-- All currencies from metals.dev CurrenciesApiResponse
-- =============================================================================

CREATE TYPE currency_type AS ENUM (
  'AED', 'AUD', 'BHD', 'BTC', 'CAD', 'CHF', 'CNH', 'CNY',
  'DKK', 'DZD', 'EGP', 'EUR', 'GBP', 'HKD', 'INR', 'IQD',
  'ISK', 'JOD', 'JPY', 'KPW', 'KRW', 'KWD', 'LYD', 'MAD',
  'MYR', 'NOK', 'NZD', 'OMR', 'QAR', 'RUB', 'SAR', 'SEK',
  'SGD', 'TND', 'TRY', 'USD', 'ZAR'
);

COMMENT ON TYPE currency_type IS 'Supported currencies from metals.dev API';

-- =============================================================================
-- SECTION 3: UPDATE METAL TYPE ENUM
-- Add metals from metals.dev MetalsApiResponse
-- =============================================================================

ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'PALLADIUM';
ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'COPPER';
ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'ALUMINUM';
ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'LEAD';
ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'NICKEL';
ALTER TYPE metal_type ADD VALUE IF NOT EXISTS 'ZINC';

-- =============================================================================
-- SECTION 4: MIGRATE CURRENCY COLUMNS (CHAR(3) -> currency_type)
-- =============================================================================

-- accounts.currency
ALTER TABLE public.accounts 
  ALTER COLUMN currency DROP DEFAULT,
  ALTER COLUMN currency TYPE currency_type USING currency::currency_type,
  ALTER COLUMN currency SET DEFAULT 'EGP';

-- assets.currency
ALTER TABLE public.assets 
  ALTER COLUMN currency DROP DEFAULT,
  ALTER COLUMN currency TYPE currency_type USING currency::currency_type,
  ALTER COLUMN currency SET DEFAULT 'EGP';

-- transactions.currency
ALTER TABLE public.transactions 
  ALTER COLUMN currency TYPE currency_type USING currency::currency_type;

-- transfers.currency
ALTER TABLE public.transfers 
  ALTER COLUMN currency TYPE currency_type USING currency::currency_type;

-- budgets.currency
ALTER TABLE public.budgets 
  ALTER COLUMN currency DROP DEFAULT,
  ALTER COLUMN currency TYPE currency_type USING currency::currency_type,
  ALTER COLUMN currency SET DEFAULT 'EGP';

-- =============================================================================
-- SECTION 5: RENAME TABLES
-- =============================================================================

ALTER TABLE IF EXISTS public.market_rates_history 
  RENAME TO daily_market_rates_snapshot;

COMMENT ON TABLE public.daily_market_rates_snapshot IS 'Daily snapshots of market rates for historical tracking';

-- =============================================================================
-- SECTION 6: STANDARDIZE SNAPSHOT TABLES (use only created_at)
-- =============================================================================

-- 6.1 daily_snapshot_balance: Drop snapshot_date
ALTER TABLE public.daily_snapshot_balance 
  DROP CONSTRAINT IF EXISTS daily_snapshot_balance_user_id_snapshot_date_key;

ALTER TABLE public.daily_snapshot_balance 
  DROP COLUMN IF EXISTS snapshot_date;

-- Create a regular index for query performance (we rely on DELETE+INSERT for uniqueness per day)
CREATE INDEX IF NOT EXISTS idx_daily_snapshot_balance_created 
  ON public.daily_snapshot_balance (created_at);

-- 6.2 daily_snapshot_assets: Drop snapshot_date
ALTER TABLE public.daily_snapshot_assets 
  DROP CONSTRAINT IF EXISTS daily_snapshot_assets_user_id_snapshot_date_key;

ALTER TABLE public.daily_snapshot_assets 
  DROP COLUMN IF EXISTS snapshot_date;

CREATE INDEX IF NOT EXISTS idx_daily_snapshot_assets_created 
  ON public.daily_snapshot_assets (created_at);

-- 6.3 daily_snapshot_net_worth: Drop updated_at, add created_at
ALTER TABLE public.daily_snapshot_net_worth 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.daily_snapshot_net_worth 
  DROP COLUMN IF EXISTS updated_at;

-- 6.4 daily_market_rates_snapshot: Drop snapshot_date
ALTER TABLE public.daily_market_rates_snapshot 
  DROP CONSTRAINT IF EXISTS market_rates_history_snapshot_date_key;

ALTER TABLE public.daily_market_rates_snapshot 
  DROP COLUMN IF EXISTS snapshot_date;

CREATE INDEX IF NOT EXISTS idx_daily_market_rates_snapshot_created 
  ON public.daily_market_rates_snapshot (created_at);

-- =============================================================================
-- SECTION 7: EXPAND MARKET_RATES TABLE
-- Add all metals and currencies from metals.dev API
-- =============================================================================

-- 7.1 Metal prices (EGP per gram)
ALTER TABLE public.market_rates
  ADD COLUMN IF NOT EXISTS platinum_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS palladium_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_gold_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_gold_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_silver_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_platinum_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_platinum_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_palladium_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_palladium_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS copper_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS aluminum_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lead_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nickel_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS zinc_egp_per_gram DECIMAL(15, 4);

-- 7.2 Currency exchange rates (to EGP)
ALTER TABLE public.market_rates
  ADD COLUMN IF NOT EXISTS aed_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS aud_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS bhd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS btc_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cad_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS chf_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cnh_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cny_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS dkk_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS dzd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS gbp_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS hkd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS inr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS iqd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS isk_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS jod_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS jpy_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS kpw_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS krw_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS kwd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lyd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS mad_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS myr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nok_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nzd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS omr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS qar_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS rub_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sar_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sek_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sgd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS tnd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS try_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS zar_egp DECIMAL(15, 4);

-- 7.3 Timestamps from API
ALTER TABLE public.market_rates
  ADD COLUMN IF NOT EXISTS timestamp_metal TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timestamp_currency TIMESTAMPTZ;

-- =============================================================================
-- SECTION 8: EXPAND DAILY_MARKET_RATES_SNAPSHOT TABLE
-- Same columns as market_rates (excluding timestamps)
-- =============================================================================

-- 8.1 Metal prices
ALTER TABLE public.daily_market_rates_snapshot
  ADD COLUMN IF NOT EXISTS platinum_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS palladium_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_gold_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_gold_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_silver_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_platinum_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_platinum_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_palladium_am_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lbma_palladium_pm_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS copper_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS aluminum_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lead_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nickel_egp_per_gram DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS zinc_egp_per_gram DECIMAL(15, 4);

-- 8.2 Currency exchange rates
ALTER TABLE public.daily_market_rates_snapshot
  ADD COLUMN IF NOT EXISTS gbp_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS aed_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS aud_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS bhd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS btc_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cad_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS chf_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cnh_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS cny_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS dkk_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS dzd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS hkd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS inr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS iqd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS isk_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS jod_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS jpy_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS kpw_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS krw_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS kwd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS lyd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS mad_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS myr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nok_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS nzd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS omr_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS qar_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS rub_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sar_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sek_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS sgd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS tnd_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS try_egp DECIMAL(15, 4),
  ADD COLUMN IF NOT EXISTS zar_egp DECIMAL(15, 4);

-- =============================================================================
-- SECTION 9: UPDATE recalculate_daily_snapshot_balance FUNCTION
-- Handle all currency types dynamically
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
  WHERE user_id IN (SELECT DISTINCT user_id FROM public.accounts WHERE deleted = false)
    AND DATE(created_at) = today;

  INSERT INTO public.daily_snapshot_balance (user_id, total_accounts_egp, breakdown, created_at)
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
    NOW()
  FROM public.accounts a
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY timestamp DESC LIMIT 1) r
  WHERE a.deleted = false
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 10: UPDATE recalculate_daily_snapshot_assets FUNCTION
-- Handle all metal types
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
  WHERE user_id IN (SELECT DISTINCT a.user_id FROM public.assets a WHERE a.deleted = false AND a.type = 'METAL')
    AND DATE(created_at) = today;

  INSERT INTO public.daily_snapshot_assets (user_id, total_assets_egp, breakdown, created_at)
  SELECT 
    a.user_id,
    SUM(
      am.weight_grams * (am.purity_karat::decimal / 24) * 
      CASE am.metal_type 
        WHEN 'GOLD' THEN r.gold_egp_per_gram
        WHEN 'SILVER' THEN r.silver_egp_per_gram
        WHEN 'PLATINUM' THEN r.platinum_egp_per_gram
        WHEN 'PALLADIUM' THEN r.palladium_egp_per_gram
        WHEN 'COPPER' THEN r.copper_egp_per_gram
        WHEN 'ALUMINUM' THEN r.aluminum_egp_per_gram
        WHEN 'LEAD' THEN r.lead_egp_per_gram
        WHEN 'NICKEL' THEN r.nickel_egp_per_gram
        WHEN 'ZINC' THEN r.zinc_egp_per_gram
        ELSE 0
      END
    )::DECIMAL(15, 2),
    jsonb_agg(
      jsonb_build_object(
        'asset_id', a.id,
        'name', a.name,
        'metal_type', am.metal_type,
        'weight_grams', am.weight_grams,
        'purity_karat', am.purity_karat,
        'value_egp', am.weight_grams * (am.purity_karat::decimal / 24) * 
          CASE am.metal_type 
            WHEN 'GOLD' THEN r.gold_egp_per_gram
            WHEN 'SILVER' THEN r.silver_egp_per_gram
            WHEN 'PLATINUM' THEN r.platinum_egp_per_gram
            WHEN 'PALLADIUM' THEN r.palladium_egp_per_gram
            WHEN 'COPPER' THEN r.copper_egp_per_gram
            WHEN 'ALUMINUM' THEN r.aluminum_egp_per_gram
            WHEN 'LEAD' THEN r.lead_egp_per_gram
            WHEN 'NICKEL' THEN r.nickel_egp_per_gram
            WHEN 'ZINC' THEN r.zinc_egp_per_gram
            ELSE 0
          END
      )
    ),
    NOW()
  FROM public.assets a
  JOIN public.asset_metals am ON am.asset_id = a.id
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY timestamp DESC LIMIT 1) r
  WHERE a.deleted = false AND a.type = 'METAL'
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 11: UPDATE recalculate_daily_snapshot_net_worth FUNCTION
-- Read from snapshot tables instead of recalculating
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

  -- Upsert net worth from today's snapshots
  INSERT INTO public.daily_snapshot_net_worth (user_id, total_accounts, total_assets, total_net_worth, created_at)
  SELECT 
    COALESCE(b.user_id, a.user_id) AS user_id,
    COALESCE(b.total_accounts_egp, 0)::DECIMAL(15, 2) AS total_accounts,
    COALESCE(a.total_assets_egp, 0)::DECIMAL(15, 2) AS total_assets,
    (COALESCE(b.total_accounts_egp, 0) + COALESCE(a.total_assets_egp, 0))::DECIMAL(15, 2) AS total_net_worth,
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
  WHERE (COALESCE(b.total_accounts_egp, 0) + COALESCE(a.total_assets_egp, 0)) > 0
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_accounts = EXCLUDED.total_accounts,
    total_assets = EXCLUDED.total_assets,
    total_net_worth = EXCLUDED.total_net_worth,
    created_at = NOW();
END;
$$;

-- =============================================================================
-- SECTION 12: UPDATE save_daily_market_rates_snapshot FUNCTION
-- Save all new columns
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
  DELETE FROM public.daily_market_rates_snapshot WHERE DATE(created_at) = today;

  INSERT INTO public.daily_market_rates_snapshot (
    -- Base metals
    gold_egp_per_gram, silver_egp_per_gram, platinum_egp_per_gram, palladium_egp_per_gram,
    -- LBMA metals
    lbma_gold_am_egp_per_gram, lbma_gold_pm_egp_per_gram, lbma_silver_egp_per_gram,
    lbma_platinum_am_egp_per_gram, lbma_platinum_pm_egp_per_gram,
    lbma_palladium_am_egp_per_gram, lbma_palladium_pm_egp_per_gram,
    -- Industrial metals
    copper_egp_per_gram, aluminum_egp_per_gram, lead_egp_per_gram, nickel_egp_per_gram, zinc_egp_per_gram,
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
    lbma_gold_am_egp_per_gram, lbma_gold_pm_egp_per_gram, lbma_silver_egp_per_gram,
    lbma_platinum_am_egp_per_gram, lbma_platinum_pm_egp_per_gram,
    lbma_palladium_am_egp_per_gram, lbma_palladium_pm_egp_per_gram,
    copper_egp_per_gram, aluminum_egp_per_gram, lead_egp_per_gram, nickel_egp_per_gram, zinc_egp_per_gram,
    usd_egp, eur_egp, gbp_egp,
    aed_egp, aud_egp, bhd_egp, btc_egp, cad_egp, chf_egp, cnh_egp, cny_egp,
    dkk_egp, dzd_egp, hkd_egp, inr_egp, iqd_egp, isk_egp, jod_egp, jpy_egp,
    kpw_egp, krw_egp, kwd_egp, lyd_egp, mad_egp, myr_egp, nok_egp, nzd_egp,
    omr_egp, qar_egp, rub_egp, sar_egp, sek_egp, sgd_egp, tnd_egp, try_egp, zar_egp,
    NOW()
  FROM public.market_rates
  ORDER BY timestamp DESC
  LIMIT 1;
END;
$$;

-- Rename the old function if it exists
DROP FUNCTION IF EXISTS public.save_market_rates_history();

-- =============================================================================
-- SECTION 13: UPDATE run_daily_snapshots FUNCTION
-- Use renamed function
-- =============================================================================

CREATE OR REPLACE FUNCTION public.run_daily_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Run all snapshot functions in sequence
  PERFORM public.recalculate_daily_snapshot_balance();
  PERFORM public.recalculate_daily_snapshot_assets();
  PERFORM public.save_daily_market_rates_snapshot();
  PERFORM public.recalculate_daily_snapshot_net_worth();
  
  RAISE NOTICE 'Daily snapshots completed at %', NOW();
END;
$$;

-- =============================================================================
-- SECTION 14: UPDATE COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.recalculate_daily_snapshot_balance IS 'Creates daily balance snapshots - uses latest market rates, handles all currencies';
COMMENT ON FUNCTION public.recalculate_daily_snapshot_assets IS 'Creates daily asset snapshots - uses latest market rates, handles all metals';
COMMENT ON FUNCTION public.recalculate_daily_snapshot_net_worth IS 'Creates daily net worth snapshots from balance and asset snapshots';
COMMENT ON FUNCTION public.save_daily_market_rates_snapshot IS 'Saves current market rates to daily snapshot table';
COMMENT ON FUNCTION public.run_daily_snapshots IS 'Master function that runs all daily snapshot functions in order';
