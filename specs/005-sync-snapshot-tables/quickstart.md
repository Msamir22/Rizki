# Quickstart: Sync Snapshot Tables

## Prerequisites

- Node.js 18+
- npm workspaces configured (`npm install` at repo root)
- Access to Supabase project (for `db:push`)

## Migration Order

1. **Create migration file**: `supabase/migrations/025_sync_snapshot_tables.sql`
2. **Push to remote**: `npm run db:push`
3. **Update transform-schema config**: Edit `scripts/transform-schema.js`
4. **Regenerate types & models**: `npm run db:migrate`
5. **Modify sync logic**: Edit `apps/mobile/services/sync.ts`
6. **Replace API with local query**: Edit `apps/mobile/hooks/useNetWorth.ts`
7. **Delete API service**: Remove `apps/mobile/services/net-worth.ts`
8. **Delete API route**: Remove `apps/api/src/routes/net-worth-comparison.ts`
9. **Clean up API index**: Edit `apps/api/src/index.ts`
10. **Verify**: Run typecheck and lint

## Key Commands

```bash
# Apply migration to remote Supabase
npm run db:push

# Regenerate WatermelonDB schema, models, and local migrations
npm run db:migrate

# Typecheck the monorepo
npx nx run-many --target=typecheck --all

# Lint check
npx nx run-many --target=lint --all
```
