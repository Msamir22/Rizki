# Session: Debt & Recurring Payments Schema

**Date:** 2026-01-02 **Time:** 03:04 - 21:51 **Duration:** ~2 hours (spread
across day)

---

## Summary

Finalized the database schema for managing debts and recurring payments,
including their interaction with transactions. Defined the `debts` table
structure, created user-visible debt-related categories, and established the
flow for linking transactions to debts. Separated `debts` and
`recurring_payments` into distinct tables with an optional link between them for
installment payments.

---

## What Was Accomplished

### Files Modified

| File                                  | Changes                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `docs/business/business-decisions.md` | Added Section 6 (Debts & Loans) and Section 7 (Recurring Payments) |
| `docs/business/business-discovery.md` | Marked Q4 as completed                                             |

### Key Decisions Made

1. **Separate Tables:** `debts` and `recurring_payments` are distinct tables,
   not merged. A recurring payment can optionally link to a debt for installment
   scenarios.

2. **Transaction Linking:** Transactions have `linked_debt_id` and
   `linked_recurring_id` foreign keys to connect to their source.

3. **Debt Status Flow:** ACTIVE → PARTIALLY_PAID → SETTLED/WRITTEN_OFF

4. **Recurring Action Types:** Either `AUTO_CREATE` (automatically creates
   transactions) or `NOTIFY` (sends reminder notification)

---

## Business Logic Changes

### Debts Table Schema (business-decisions.md Section 6)

| Column               | Type    | Description                                                  |
| -------------------- | ------- | ------------------------------------------------------------ |
| `id`                 | UUID    | Primary Key                                                  |
| `user_id`            | UUID    | FK → auth.users                                              |
| `type`               | ENUM    | `'LENT'`, `'BORROWED'`                                       |
| `party_name`         | TEXT    | Who you lent to / borrowed from                              |
| `original_amount`    | DECIMAL | Initial debt amount                                          |
| `outstanding_amount` | DECIMAL | Remaining balance                                            |
| `account_id`         | UUID    | FK → accounts.id                                             |
| `date`               | DATE    | When debt was created                                        |
| `due_date`           | DATE    | When repayment expected                                      |
| `status`             | ENUM    | `'ACTIVE'`, `'PARTIALLY_PAID'`, `'SETTLED'`, `'WRITTEN_OFF'` |

### Recurring Payments Table Schema (business-decisions.md Section 7)

| Column           | Type    | Description                                                               |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| `id`             | UUID    | Primary Key                                                               |
| `name`           | TEXT    | Name (e.g., "Netflix", "Car Installment")                                 |
| `amount`         | DECIMAL | Payment amount                                                            |
| `type`           | ENUM    | `'EXPENSE'`, `'INCOME'`                                                   |
| `frequency`      | ENUM    | `'DAILY'`, `'WEEKLY'`, `'MONTHLY'`, `'QUARTERLY'`, `'YEARLY'`, `'CUSTOM'` |
| `action`         | ENUM    | `'AUTO_CREATE'`, `'NOTIFY'`                                               |
| `linked_debt_id` | UUID    | Optional FK → debts.id                                                    |

### Debt Flow

```
┌──────────────┐                    ┌────────────────────────┐
│    DEBTS     │ ──────────────────→│  RECURRING PAYMENTS    │
└──────────────┘   can HAVE         └────────────────────────┘
      │                                       │
      │ linked via                            │ linked via
      ↓                                       ↓
┌──────────────┐                    ┌────────────────────────┐
│ TRANSACTIONS │                    │     TRANSACTIONS       │
└──────────────┘                    └────────────────────────┘
```

---

## Technical Details

### Repayment Logic

When a repayment transaction is created and linked to a debt:

1. `outstanding_amount` decreases by repayment amount
2. If `outstanding_amount = 0` → `status = 'SETTLED'`
3. If partial → `status = 'PARTIALLY_PAID'`

---

## Pending Items

- [ ] Create WatermelonDB models for debts and recurring_payments
- [ ] Design debt form UI
- [ ] Implement recurring payment scheduler

---

## Context for Next Session

The schema is finalized in business-decisions.md. Next step is to create the
WatermelonDB models that match this schema and then build the UI forms for
creating/managing debts.
