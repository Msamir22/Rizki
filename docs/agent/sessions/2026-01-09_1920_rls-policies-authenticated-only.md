# Session: RLS Policies - Authenticated Only

**Date:** 2026-01-09 **Time:** 19:11 - 19:22 **Duration:** ~11 minutes

---

## Summary

Updated all Row Level Security (RLS) policies in the Supabase database to
restrict access to `authenticated` role only. Previously, policies defaulted to
`public` role which allowed broader access. Now only signed-in users (including
anonymous sign-in via `signInAnonymously()`) can access data. Created and
applied migration `008_update_rls_policies_to_authenticated.sql`.

---

## What Was Accomplished

### Files Created

| File                                                               | Purpose                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `supabase/migrations/008_update_rls_policies_to_authenticated.sql` | Migration to update all RLS policies to `TO authenticated` |

### Key Decisions Made

1. **Authenticated Role Only:** All policies now explicitly use
   `TO authenticated` instead of defaulting to `public`. This ensures only
   signed-in users (regular auth or anonymous sign-in) can access data.

2. **Service Role Policies Preserved:** For snapshot tables
   (`daily_snapshot_balance`, `daily_snapshot_assets`,
   `daily_snapshot_net_worth`) and market rate tables (`market_rates`,
   `market_rates_history`), the `FOR ALL TO service_role` policies were kept
   unchanged. Only the SELECT policies were updated.

3. **No Anon Role:** The user explicitly requested no `anon` role access.
   Completely unauthenticated API requests will be denied.

---

## Business Logic Changes

### RLS Policy Access Control

**Previous State:**

- Policies without explicit `TO` clause defaulted to `public` role
- This allowed access from any role including unauthenticated requests

**New State:**

- All user-data policies explicitly use `TO authenticated`
- Only users with a valid session (from `signInAnonymously()` or regular
  sign-in) can access data
- Service role policies preserved for backend operations

**Tables Updated:** | Table | Policies Changed | | ----- | ---------------- | |
`profiles` | SELECT, INSERT, UPDATE, DELETE | | `accounts` | SELECT, INSERT,
UPDATE, DELETE | | `bank_details` | SELECT, INSERT, UPDATE, DELETE | | `assets`
| SELECT, INSERT, UPDATE, DELETE | | `asset_metals` | SELECT, INSERT, UPDATE,
DELETE | | `categories` | 5 policies (system view, custom view, insert, update,
delete) | | `user_category_settings` | SELECT, INSERT, UPDATE, DELETE | |
`debts` | SELECT, INSERT, UPDATE, DELETE | | `recurring_payments` | SELECT,
INSERT, UPDATE, DELETE | | `transactions` | SELECT, INSERT, UPDATE, DELETE | |
`transfers` | SELECT, INSERT, UPDATE, DELETE | | `budgets` | SELECT, INSERT,
UPDATE, DELETE | | `daily_snapshot_net_worth` | SELECT only (service_role kept)
| | `daily_snapshot_balance` | SELECT only (service_role kept) | |
`daily_snapshot_assets` | SELECT only (service_role kept) | | `market_rates` |
SELECT renamed to "Allow authenticated read access" | | `market_rates_history` |
SELECT renamed to "Allow authenticated read access" |

---

## Technical Details

The migration uses `DROP POLICY IF EXISTS` followed by `CREATE POLICY` pattern
for safe re-application. Policy names remain the same (except for market rate
tables which were renamed from "Allow public read access" to "Allow
authenticated read access").

Key SQL pattern used:

```sql
CREATE POLICY "Policy Name" ON public.table_name
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

---

## Pending Items

- [ ] Verify policies work correctly with mobile app
- [ ] Test anonymous sign-in flow to ensure access is granted
- [ ] Update any documentation about RLS if needed

---

## Context for Next Session

All RLS policies are now restricted to authenticated users. The
`signInAnonymously()` flow should still work since it creates an authenticated
session. If any API calls fail with permission errors, check that the request is
authenticated with a valid JWT token.
