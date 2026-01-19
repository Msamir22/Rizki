-- ============================================================================
-- Migration: Add device_id to profiles for anonymous user recovery
-- ============================================================================
-- This adds a device_id column to the profiles table to enable recovering
-- anonymous user sessions after app data is cleared on Android.
--
-- The device_id stores the Android ID or iOS IDFV, which persists even when
-- the user clears app data. This allows us to link them back to their
-- existing profile/data.
-- ============================================================================

-- Add device_id column (nullable since existing profiles won't have it)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add index for fast lookups by device_id
CREATE INDEX IF NOT EXISTS idx_profiles_device_id 
ON profiles(device_id) 
WHERE device_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.device_id IS 'Device identifier (Android ID / iOS IDFV) for recovering anonymous sessions after data clear';
