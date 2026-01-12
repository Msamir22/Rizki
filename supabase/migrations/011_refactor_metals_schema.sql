-- =============================================================================
-- Migration 011: Refactor Metals Schema
-- Description: 
--   1. Keep only precious metals (GOLD, SILVER, PLATINUM, PALLADIUM)
--   2. Replace purity_karat with purity_fraction in asset_metals
--   3. Remove industrial metals and LBMA columns from market_rates tables
--   4. Update database functions
-- =============================================================================

-- =============================================================================
-- SECTION 1: UPDATE asset_metals TABLE
-- Drop purity_karat and add purity_fraction (no data migration needed - table is empty)
-- =============================================================================

ALTER TABLE public.asset_metals DROP COLUMN IF EXISTS purity_karat;
ALTER TABLE public.asset_metals ADD COLUMN purity_fraction DECIMAL(5, 4) NOT NULL DEFAULT 1.0;

COMMENT ON COLUMN public.asset_metals.purity_fraction IS 'Purity as a fraction (0.0-1.0). Gold: karat/24 (21K=0.875). Silver/Platinum/Palladium: fineness/1000 (925=0.925)';

-- =============================================================================
-- SECTION 2: REMOVE INDUSTRIAL METAL COLUMNS FROM market_rates
-- =============================================================================

ALTER TABLE public.market_rates
  DROP COLUMN IF EXISTS copper_egp_per_gram,
  DROP COLUMN IF EXISTS aluminum_egp_per_gram,
  DROP COLUMN IF EXISTS lead_egp_per_gram,
  DROP COLUMN IF EXISTS nickel_egp_per_gram,
  DROP COLUMN IF EXISTS zinc_egp_per_gram;

-- =============================================================================
-- SECTION 3: REMOVE LBMA COLUMNS FROM market_rates
-- =============================================================================

ALTER TABLE public.market_rates
  DROP COLUMN IF EXISTS lbma_gold_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_gold_pm_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_silver_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_platinum_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_platinum_pm_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_palladium_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_palladium_pm_egp_per_gram;

-- =============================================================================
-- SECTION 4: REMOVE INDUSTRIAL METAL COLUMNS FROM daily_market_rates_snapshot
-- =============================================================================

ALTER TABLE public.daily_market_rates_snapshot
  DROP COLUMN IF EXISTS copper_egp_per_gram,
  DROP COLUMN IF EXISTS aluminum_egp_per_gram,
  DROP COLUMN IF EXISTS lead_egp_per_gram,
  DROP COLUMN IF EXISTS nickel_egp_per_gram,
  DROP COLUMN IF EXISTS zinc_egp_per_gram;

-- =============================================================================
-- SECTION 5: REMOVE LBMA COLUMNS FROM daily_market_rates_snapshot
-- =============================================================================

ALTER TABLE public.daily_market_rates_snapshot
  DROP COLUMN IF EXISTS lbma_gold_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_gold_pm_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_silver_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_platinum_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_platinum_pm_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_palladium_am_egp_per_gram,
  DROP COLUMN IF EXISTS lbma_palladium_pm_egp_per_gram;

-- =============================================================================
-- SECTION 6: UPDATE recalculate_daily_snapshot_assets FUNCTION
-- Now uses purity_fraction directly (no division by 24)
-- Only handles precious metals: GOLD, SILVER, PLATINUM, PALLADIUM
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
    NOW()
  FROM public.assets a
  JOIN public.asset_metals am ON am.asset_id = a.id
  CROSS JOIN (SELECT * FROM public.market_rates ORDER BY created_at DESC LIMIT 1) r
  WHERE a.deleted = false AND a.type = 'METAL'
  GROUP BY a.user_id;
END;
$$;

-- =============================================================================
-- SECTION 7: UPDATE save_daily_market_rates_snapshot FUNCTION
-- Remove industrial metals and LBMA columns
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
    -- Precious metals only
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
-- SECTION 8: UPDATE COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.recalculate_daily_snapshot_assets IS 'Creates daily asset snapshots - uses purity_fraction directly for all precious metals (GOLD, SILVER, PLATINUM, PALLADIUM)';
COMMENT ON FUNCTION public.save_daily_market_rates_snapshot IS 'Saves current market rates to daily snapshot table (precious metals and currencies only)';

-- =============================================================================
-- SECTION 9: Note about metal_type enum
-- PostgreSQL does not allow removing values from an enum.
-- The enum still contains COPPER, ALUMINUM, LEAD, NICKEL, ZINC but they won't be used.
-- The application layer (TypeScript types) will restrict to precious metals only.
-- =============================================================================
