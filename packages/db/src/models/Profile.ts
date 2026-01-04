/**
 * Profile Model for WatermelonDB
 * User identity and preferences
 */

import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";
import type { Currency, ThemePreference, NotificationSettings } from "../types";

export class Profile extends Model {
  static table = "profiles";

  @field("user_id") userId!: string;
  @field("first_name") firstName?: string;
  @field("last_name") lastName?: string;
  @field("display_name") displayName?: string;
  @field("avatar_url") avatarUrl?: string;
  @field("preferred_currency") preferredCurrency!: Currency;
  @field("theme") theme!: ThemePreference;
  @field("sms_detection_enabled") smsDetectionEnabled!: boolean;
  @field("onboarding_completed") onboardingCompleted!: boolean;
  @field("notification_settings") notificationSettingsJson?: string;
  @field("deleted") deleted!: boolean;

  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  get notificationSettings(): NotificationSettings | null {
    if (!this.notificationSettingsJson) return null;
    try {
      return JSON.parse(this.notificationSettingsJson) as NotificationSettings;
    } catch {
      return null;
    }
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.displayName || this.firstName || "";
  }
}
