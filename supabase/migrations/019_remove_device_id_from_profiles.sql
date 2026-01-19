-- ============================================================================
-- Migration: Remove device_id from profiles (reverting 018)
-- ============================================================================
-- Removing device_id column as we decided not to implement automatic data 
-- recovery for anonymous users. Users who clear app data do so intentionally.
-- We will instead encourage users to create an account to persist their data.
-- ============================================================================

-- Drop the index first
DROP INDEX IF EXISTS idx_profiles_device_id;

-- Remove the device_id column
ALTER TABLE profiles DROP COLUMN IF EXISTS device_id;
