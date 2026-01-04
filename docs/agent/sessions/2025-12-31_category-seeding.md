# Session: Seeding Categories on Launch

**Date:** 2025-12-31 to 2026-01-04 **Time:** Multiple sessions **Duration:** ~4
hours (across multiple days)

---

## Summary

Implemented the category seeding system that populates predefined system
categories into WatermelonDB when the app is launched for the first time.
Created a utility function that checks if categories already exist and populates
the database with a predefined list of system categories including display
names, icons, colors, types (expense/income), and sort order.

---

## What Was Accomplished

### Files Created

| File                                         | Purpose                                                        |
| -------------------------------------------- | -------------------------------------------------------------- |
| `packages/db/utils/seedCategories.ts`        | Utility function to seed predefined categories on first launch |
| `packages/db/models/UserCategorySettings.ts` | Model for per-user settings on system categories               |

### Files Modified

| File                             | Changes                                 |
| -------------------------------- | --------------------------------------- |
| `packages/db/models/Category.ts` | Added new fields for category hierarchy |

### Key Decisions Made

1. **Seeding Strategy:** Categories are seeded on first app launch, not on every
   launch. A check prevents duplicate seeding.

2. **System vs User Categories:** System categories have `is_system: true` and
   cannot be edited/deleted by users.

3. **Internal Categories:** Added `is_internal` flag for categories that should
   be hidden from the category picker (e.g., `asset_purchase`, `asset_sale`).

4. **Re-seed Function:** Created a development utility to re-seed categories for
   testing purposes.

---

## Business Logic Changes

### Category Seeding Rules

1. **First Launch Detection:** Check if any categories exist before seeding
2. **System Categories:** All L1 and L2 categories are predefined and locked
3. **User Categories:** Users can add custom categories at any level (L1, L2,
   L3)
4. **Visibility Control:** Users can hide any category but cannot delete system
   ones

### Category Structure (from business-decisions.md Section 5)

- **Level 1 (L1):** Main categories (Food & Drinks, Transportation, etc.)
- **Level 2 (L2):** Subcategories (Groceries, Restaurant, etc.)
- **Level 3 (L3):** User-defined only (no predefined L3 categories)

---

## Technical Details

### seedCategories.ts Structure

```typescript
export async function seedCategories(database: Database): Promise<void> {
  // 1. Check if categories already exist
  // 2. If not, batch insert all predefined categories
  // 3. Set proper parent_id relationships for hierarchy
}

export async function reseedCategories(database: Database): Promise<void> {
  // Development utility to clear and re-seed
}
```

---

## Pending Items

- [ ] Test category seeding on fresh app install
- [ ] Implement category picker UI
- [ ] Connect categories to transaction form

---

## Context for Next Session

The seeding utility is complete but needs integration testing. The next step is
to verify it runs correctly on first app launch and then build the category
picker UI component.
