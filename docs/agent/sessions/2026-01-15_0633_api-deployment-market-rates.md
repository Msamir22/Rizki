# Session: Anonymous Sign-In, Vercel Deployment & Market Rates Consolidation

**Date:** 2026-01-15 **Time:** 06:33 - 08:48 **Duration:** ~2 hours 15 minutes

---

## Summary

This session focused on three major areas: implementing anonymous sign-in for
guest mode, deploying the Express API to Vercel, and consolidating the market
rates database tables. We also integrated React Query for caching API responses
to prevent duplicate calls from multiple components.

---

## What Was Accomplished

### Files Created

| File                                                          | Purpose                                             |
| ------------------------------------------------------------- | --------------------------------------------------- |
| `apps/api/vercel.json`                                        | Vercel serverless deployment configuration          |
| `apps/mobile/providers/QueryProvider.tsx`                     | React Query provider with sensible defaults         |
| `supabase/migrations/015_consolidate_market_rates_tables.sql` | Migration to merge snapshot table into market_rates |
| `supabase/migrations/016_market_rates_uuid_id.sql`            | Migration to convert market_rates id to UUID        |

### Files Modified

| File                                            | Changes                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `apps/mobile/services/supabase.ts`              | Added `ensureAuthenticated()` with exponential backoff retry        |
| `apps/mobile/app/index.tsx`                     | Integrated anonymous sign-in on app launch                          |
| `apps/api/src/index.ts`                         | Refactored for Vercel serverless (conditional listen, env handling) |
| `apps/api/src/middleware/auth.ts`               | Added PUBLIC_PATHS to skip auth for health check                    |
| `apps/api/src/routes/market-rates.ts`           | Changed `.single()` to `.maybeSingle()`, switched to admin client   |
| `apps/api/src/routes/market-rates-snapshot.ts`  | Updated to query `market_rates` instead of dropped table            |
| `supabase/functions/fetch-metal-rates/index.ts` | Changed from upsert to insert (preserves history)                   |
| `apps/mobile/hooks/useMarketRates.ts`           | Refactored to use React Query for caching                           |
| `apps/mobile/app/_layout.tsx`                   | Added QueryProvider wrapper                                         |
| `apps/mobile/.env`                              | Added DEV/PROD API URLs with auto-detection                         |
| `apps/mobile/services/request.ts`               | Added auto-detection of local IP via expo-constants                 |
| `package.json`                                  | Added `fn:deploy:rates` command                                     |

### Key Decisions Made

1. **Anonymous Sign-In Strategy:** Silent retry with exponential backoff (500ms
   → 1s → 2s). App continues offline if auth fails.

2. **Vercel Deployment Strategy:** Two separate projects for dev/prod due to
   free tier limitations. Dev project linked to `main` branch, prod project
   linked to `release` branch.

3. **Market Rates Consolidation:** Dropped `daily_snapshot_market_rates` table.
   Unified all rates in `market_rates` table with history preserved via INSERT
   (no more single-row upsert).

4. **React Query for Caching:** Added `@tanstack/react-query` to prevent
   multiple API calls when `useMarketRates` is used in multiple components.

---

## Business Logic Changes

### Market Rates Storage Strategy

Previously: Single row in `market_rates` (upsert) + separate
`daily_snapshot_market_rates` for history.

Now: All rates stored in `market_rates` table with INSERT. Each cron job run
creates a new row. Historical lookups use `created_at` timestamp instead of
`snapshot_date`.

**Rationale:** Eliminates duplicate table, simplifies schema, enables realtime
updates to work correctly.

---

## Database Changes

1. **Migration 015:**
   - Removed `single_row_constraint` from market_rates
   - Migrated data from daily_snapshot_market_rates (created_at = snapshot_date
     at 21:00 UTC)
   - Dropped daily_snapshot_market_rates table
   - Added index on created_at for efficient lookups

2. **Migration 016:**
   - Converted market_rates.id from integer to UUID
   - All existing rows now have UUID primary keys

---

## Technical Details

### API URL Auto-Detection

The mobile app now auto-detects the local IP for development using
`expo-constants`:

```typescript
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost.split(":")[0];
return `http://${localIp}:3001`;
```

### React Query Integration

- `QueryProvider` wraps the app with sensible defaults (5 min stale time, 30 min
  cache)
- `useMarketRates` uses `useQuery` with realtime subscription that updates cache
  directly
- Multiple components calling the same hook share cached data

---

## Pending Items

- [ ] Deploy updated edge function: `npm run fn:deploy:rates`
- [ ] Test anonymous sign-in flow on fresh install
- [ ] Commit all changes to git and push to trigger Vercel deployments

---

## Context for Next Session

The market rates system is now fully consolidated with React Query caching. The
edge function needs to be deployed to use INSERT instead of UPSERT. The
anonymous sign-in is integrated at app launch with silent retry.

Key files to reference:

- `apps/mobile/providers/QueryProvider.tsx` - React Query setup
- `apps/mobile/hooks/useMarketRates.ts` - Caching + realtime pattern
- `supabase/functions/fetch-metal-rates/index.ts` - Updated to insert
