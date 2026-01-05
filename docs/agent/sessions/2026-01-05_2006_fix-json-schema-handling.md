# Session: Fix JSON Field Handling in Schema

**Date:** 2026-01-05 **Time:** 19:38 - 20:06 **Duration:** ~30 minutes

---

## Summary

The session focused on fixing an issue where JSON fields (specifically
`notification_settings` in `profiles`) were being incorrectly transformed into
simple `string` types in the WatermelonDB schema generation process, causing
TypeScript type mismatches. We updated the `transform-schema.js` script to
handle JSON fields by appending a `Raw` suffix to the property name in the base
model (e.g., `notificationSettingsRaw`) while keeping the type as `string`.
Extended models were updated to include manual getters that parse this raw
string into the correct TypeScript interface.

---

## What Was Accomplished

### Files Created

| File                                             | Purpose             |
| ------------------------------------------------ | ------------------- |
| `packages/db/src/models/RecurringPayment.ts`     | Extended model stub |
| `packages/db/src/models/Transaction.ts`          | Extended model stub |
| `packages/db/src/models/Transfer.ts`             | Extended model stub |
| `packages/db/src/models/UserCategorySettings.ts` | Extended model stub |

### Files Modified

| File                                          | Changes                                                                                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/transform-schema.js`                 | Updated logic to treat configured JSON fields as "Known JSON Fields", appending `Raw` suffix to the property name in the base model generation. Removed incorrect TypeScript type linkage for base fields. |
| `packages/db/src/models/base/base-profile.ts` | Regenerated to include `notificationSettingsRaw` instead of `notificationSettings`.                                                                                                                        |
| `packages/db/src/models/Profile.ts`           | Updated getter to use `notificationSettingsRaw` and parse it into `NotificationSettings`.                                                                                                                  |

### Key Decisions Made

1.  **JSON Field Handling:** WatermelonDB/SQLite stores JSON as strings. To
    avoid confusion, base model properties for JSON fields will be suffixed with
    `Raw` (e.g., `notificationSettingsRaw`) and typed as `string`.
2.  **Manual Parsing:** Extended models are responsible for parsing these raw
    strings into typed objects using getters. This ensures runtime safety and
    correct TypeScript usage.

---

## Business Logic Changes

No business logic changes in this session.

---

## Technical Details

- The `transform-schema.js` script now has a `JSON_FIELDS` array configuration.
  Any column name in this array will be generated with a `Raw` suffix in the
  base model.
- This approach avoids the issue where a property is typed as an interface
  (e.g., `NotificationSettings`) but returns a string at runtime.

---

## Pending Items

- [ ] Monitor if other JSON fields need strict typing and add them to the
      `JSON_FIELDS` array in `transform-schema.js` if necessary.

---

## Context for Next Session

The schema transformation script is now more robust. If you add new JSON columns
to Supabase that need strict typing in the app, remember to add them to the
`JSON_FIELDS` array in `scripts/transform-schema.js` and implement the parsing
getter in the corresponding extended model.
