-- Feature: 026-onboarding-restructure
-- Adds per-profile first-run tooltip dismissal markers as JSONB.
-- See specs/026-onboarding-restructure/contracts/onboarding-flags-schema.md
-- for the authoritative shape and semantic contract.

ALTER TABLE profiles
  ADD COLUMN onboarding_flags JSONB NOT NULL DEFAULT '{}'::JSONB;

COMMENT ON COLUMN profiles.onboarding_flags
  IS 'Per-profile first-run tooltip dismissal markers. Boolean keys added '
     'without schema migrations. See spec 026-onboarding-restructure.';
