-- =============================================================================
-- Migration 007: Make market_rates fields non-nullable
-- Description: Make market_rates fields non-nullable
-- =============================================================================


ALTER TABLE market_rates
ALTER COLUMN silver_egp_per_gram SET NOT NULL,
ALTER COLUMN usd_egp SET NOT NULL,
ALTER COLUMN gold_egp_per_gram SET NOT NULL,
ALTER COLUMN eur_egp SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

