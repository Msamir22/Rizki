# Session: Schema Sync Automation

**Date:** 2026-01-05 **Time:** ~15:00 - 18:54 **Duration:** ~4 hours

---

## Summary

Implemented a code-first schema synchronization workflow between Supabase and
WatermelonDB. Created a transform script that parses `supabase-types.ts` and
generates WatermelonDB schema, types, and model files automatically. The system
uses an abstract base model pattern where auto-generated base classes
(`base-*.ts`) are extended by manually-maintained model classes that contain
custom getters and methods.

---

## What Was Accomplished

### Files Created

| File                               | Purpose                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `scripts/transform-schema.js`      | Main transform script that parses Supabase types and generates WatermelonDB files |
| `packages/db/src/models/base/*.ts` | 12 abstract base model classes (auto-generated)                                   |
| `packages/db/src/models/*.ts`      | 12 extended model classes (manually maintained)                                   |

### Files Modified

| File                        | Changes                                                 |
| --------------------------- | ------------------------------------------------------- |
| `package.json`              | Added `db:types`, `db:transform`, `db:sync` NPM scripts |
| `packages/db/src/schema.ts` | Now auto-generated from Supabase types                  |
| `packages/db/src/types.ts`  | Now auto-generated with enums from Supabase             |
| `packages/db/src/index.ts`  | Now auto-generated, exports extended models only        |

### Key Decisions Made

1. **Base/Extended Model Pattern:** Auto-generated abstract base classes in
   `models/base/` are extended by manually-maintained classes in `models/`. This
   preserves custom getters while allowing schema regeneration.

2. **Keep Auto-Generated Files Committed:** Decided to commit all auto-generated
   files to git for better visibility of schema changes and easier onboarding.

3. **Tables Excluded from Local Sync:** `daily_snapshot_assets`,
   `daily_snapshot_balance`, `market_rates`, `market_rates_history`,
   `user_net_worth_summary` - these are server-computed read-only tables.

---

## Business Logic Changes

No business logic changes in this session. This was purely a developer tooling
improvement.

---

## Technical Details

### Transform Script Workflow

1. Reads `packages/db/src/supabase-types.ts`
2. Parses table definitions, columns, relationships, and enums
3. Generates:
   - `schema.ts` - WatermelonDB appSchema
   - `types.ts` - TypeScript enum types
   - `models/base/*.ts` - Abstract base model classes (always overwritten)
   - `models/*.ts` - Extended model stubs (only created if missing)
   - `index.ts` - Exports for all models

### NPM Scripts

```bash
npm run db:types      # Generate supabase-types.ts from Supabase
npm run db:transform  # Run transform script
npm run db:sync       # Both steps combined
```

### File Structure

`text\npackages/db/src/\n├── models/\n│   ├── base/           ← AUTO-GENERATED (always overwritten)\n│   │   └── base-*.ts\n│   └── *.ts            ← MANUALLY MAINTAINED (never overwritten)\n├── schema.ts           ← AUTO-GENERATED\n├── types.ts            ← AUTO-GENERATED\n├── supabase-types.ts   ← AUTO-GENERATED (from Supabase CLI)\n└── index.ts            ← AUTO-GENERATED\n`

---

## Pending Items

- [ ] Add custom getters to other models as needed (only Transaction has getters
      currently)
- [ ] Consider adding schema version auto-increment logic

---

## Context for Next Session

The schema sync automation is complete. When making database schema changes:

1. Create migration: `npx supabase migration new <name>`
2. Write SQL, push: `npm run supabase:push`
3. Sync: `npm run db:sync`
4. Add custom methods to extended models as needed

Extended model files are never overwritten, so any custom getters/methods will
be preserved.
