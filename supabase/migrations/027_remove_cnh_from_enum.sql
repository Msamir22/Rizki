-- Remove CNH from currency_type enum
-- CNH was added in migration 009 but is not supported by the app
-- (not in SUPPORTED_CURRENCIES or CURRENCY_INFO_MAP)

-- Postgres does not support ALTER TYPE ... DROP VALUE directly.
-- We must rename the old type, create a new one without CNH,
-- and migrate all columns that reference it.
--
-- Columns with DEFAULT values cast to the old enum must have their
-- defaults dropped before the type change and restored afterwards,
-- otherwise Postgres raises "cannot be cast automatically" (SQLSTATE 42804).

BEGIN;

-- 1. Rename the existing enum
ALTER TYPE currency_type RENAME TO currency_type_old;

-- 2. Create new enum without CNH
CREATE TYPE currency_type AS ENUM (
  'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
  'IQD', 'LYD', 'TND', 'MAD', 'DZD',
  'USD', 'EUR', 'GBP', 'JPY', 'CHF',
  'CNY', 'INR', 'KRW', 'KPW', 'SGD', 'HKD', 'MYR', 'AUD', 'NZD',
  'CAD',
  'SEK', 'NOK', 'DKK', 'ISK', 'TRY', 'RUB',
  'ZAR',
  'BTC'
);

-- 3. Drop defaults on columns that reference the old enum
--    (Postgres cannot auto-cast defaults during ALTER TYPE)
ALTER TABLE accounts ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE assets ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE budgets ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE recurring_payments ALTER COLUMN currency DROP DEFAULT;

-- 4. Migrate all columns from old enum → text → new enum
ALTER TABLE accounts
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

ALTER TABLE assets
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

ALTER TABLE budgets
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

ALTER TABLE transactions
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

ALTER TABLE recurring_payments
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

ALTER TABLE transfers
  ALTER COLUMN currency TYPE currency_type USING currency::text::currency_type;

-- 5. Restore defaults
ALTER TABLE accounts ALTER COLUMN currency SET DEFAULT 'EGP'::currency_type;
ALTER TABLE assets ALTER COLUMN currency SET DEFAULT 'EGP'::currency_type;
ALTER TABLE budgets ALTER COLUMN currency SET DEFAULT 'EGP'::currency_type;
ALTER TABLE recurring_payments ALTER COLUMN currency SET DEFAULT 'EGP'::currency_type;

-- 6. Drop the old type
DROP TYPE currency_type_old;

COMMIT;
