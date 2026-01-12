-- =============================================================================
-- Migration 012: Remove Industrial Metals from Enum
-- Description: Recreate metal_type enum with only precious metals
-- Note: PostgreSQL doesn't allow removing values from an enum, so we recreate it
-- =============================================================================

-- Step 1: Create the new enum type
CREATE TYPE metal_type_new AS ENUM ('GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM');

-- Step 2: Update asset_metals table to use the new enum
-- First, alter the column to use the new type
ALTER TABLE public.asset_metals 
  ALTER COLUMN metal_type TYPE metal_type_new 
  USING metal_type::text::metal_type_new;

-- Step 3: Drop the old enum type
DROP TYPE metal_type;

-- Step 4: Rename the new enum to the original name
ALTER TYPE metal_type_new RENAME TO metal_type;

-- Step 5: Add comment
COMMENT ON TYPE metal_type IS 'Precious metals supported for asset tracking: GOLD, SILVER, PLATINUM, PALLADIUM';
