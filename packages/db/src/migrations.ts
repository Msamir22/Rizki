/**
 * WatermelonDB Schema Migrations
 *
 * Each migration must target the next sequential version.
 * The schema version in schema.ts is auto-resolved from the highest toVersion here.
 *
 * @see https://watermelondb.dev/docs/Advanced/Migrations
 */

import {
  addColumns,
  createTable,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 8,
      steps: [
        createTable({
          name: "daily_snapshot_assets",
          columns: [
            { name: "created_at", type: "number" },
            { name: "snapshot_date", type: "number" },
            { name: "total_assets_egp", type: "number" },
            { name: "user_id", type: "string", isIndexed: true },
          ],
        }),
        createTable({
          name: "daily_snapshot_balance",
          columns: [
            { name: "created_at", type: "number" },
            { name: "snapshot_date", type: "number" },
            { name: "total_accounts_egp", type: "number" },
            { name: "user_id", type: "string", isIndexed: true },
          ],
        }),
        createTable({
          name: "daily_snapshot_net_worth",
          columns: [
            { name: "created_at", type: "number" },
            { name: "snapshot_date", type: "number" },
            { name: "total_accounts", type: "number" },
            { name: "total_assets", type: "number" },
            { name: "total_net_worth", type: "number" },
            { name: "user_id", type: "string", isIndexed: true },
          ],
        }),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: "recurring_payments",
          columns: [{ name: "currency", type: "string" }],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: "transactions",
          columns: [{ name: "counterparty", type: "string", isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: "categories",
          columns: [{ name: "usage_count", type: "number" }],
        }),
      ],
    },
  ],
});
