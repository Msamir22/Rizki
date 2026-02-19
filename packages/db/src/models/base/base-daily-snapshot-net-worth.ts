/**
 * BaseDailySnapshotNetWorth - Abstract Base Model for WatermelonDB
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Run 'npm run db:sync' to regenerate
 *
 * Extend this class in ../DailySnapshotNetWorth.ts to add custom methods
 */

import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export abstract class BaseDailySnapshotNetWorth extends Model {
  static table = "daily_snapshot_net_worth";

  @readonly @date("created_at") createdAt!: Date;
  @date("snapshot_date") snapshotDate!: Date;
  @field("total_accounts") totalAccounts!: number;
  @field("total_assets") totalAssets!: number;
  @field("total_net_worth") totalNetWorth!: number;
  @field("user_id") userId!: string;
}
