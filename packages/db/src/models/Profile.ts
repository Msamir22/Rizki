import { NotificationSettings } from "../types";
import { BaseProfile } from "./base/base-profile";

export class Profile extends BaseProfile {
  get notificationSettings(): NotificationSettings | undefined {
    if (!this.notificationSettingsRaw) return undefined;
    try {
      return JSON.parse(this.notificationSettingsRaw) as NotificationSettings;
    } catch {
      return undefined;
    }
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.displayName || this.firstName || "";
  }
}
