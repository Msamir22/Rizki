# Feature Specification: Refactor Stats Page

**Feature Branch**: `001-refactor-stats-page`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "Code quality refactor of stats.tsx and
CategoryDrilldownCard.tsx — extract inline components to separate files, fix
isDark ternaries, fix hardcoded EGP currency, remove redundant DB subscriptions"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Stats Page Renders Identical UI After Refactor (Priority: P1)

A user opens the Stats tab and sees the exact same visual output as before: a
Monthly Overview bar chart, Quick Insights cards, and a Category Breakdown donut
chart with drill-down. No behaviour or appearance changes.

**Why this priority**: The refactor must be invisible to end users. Any visual
or functional regression breaks trust.

**Independent Test**: Open the Stats tab on a device/emulator with transactions
in the current month. Verify all three sections render with correct data,
drill-down navigation works, and period toggle switches correctly.

**Acceptance Scenarios**:

1. **Given** existing transactions, **When** user opens the Stats tab, **Then**
   Monthly Overview, Quick Insights, and Category Breakdown all render with
   correct figures.
2. **Given** a Category Breakdown showing L1 categories, **When** user taps a
   category with children, **Then** drill-down navigates to L2, breadcrumbs
   update, and amounts are correct.
3. **Given** the Stats tab is open, **When** the user toggles between 6m and 12m
   periods, **Then** the chart updates without errors.

---

### User Story 2 - Currency Values Display Correctly for Non-EGP Transactions (Priority: P2)

When a user has transactions in multiple currencies (e.g., USD, EUR), the Stats
page amounts display using each transaction's actual currency (or converted
totals where applicable) rather than always showing "EGP".

**Why this priority**: Hardcoded "EGP" is a data correctness bug affecting any
user with multi-currency transactions.

**Independent Test**: Create transactions in USD and EGP, open the Stats tab,
and verify amounts are not all labelled as EGP.

**Acceptance Scenarios**:

1. **Given** transactions in multiple currencies, **When** user views Category
   Breakdown, **Then** totals use the correct currency or are converted and
   labelled properly.
2. **Given** the Monthly Overview chart, **When** displaying totals, **Then**
   amounts reflect currency-aware formatting.

---

### User Story 3 - Dark Mode Uses Tailwind Variants (Priority: P3)

A user toggles between light and dark mode. The Stats page components adapt
correctly using Tailwind `dark:` variants with no visual glitches — no isDark
ternaries remain in the refactored code.

**Why this priority**: Aligns with project styling guidelines, reduces code
complexity, and eliminates a class of styling bugs.

**Independent Test**: Toggle dark mode on and off while viewing the Stats tab.
Verify all text, backgrounds, and borders correctly adapt.

**Acceptance Scenarios**:

1. **Given** dark mode is active, **When** user views Stats tab, **Then** all
   text, backgrounds, and borders use correct dark colours without any isDark
   ternary logic in component code (chart library props excepted).

---

### Edge Cases

- What happens when there are zero transactions for the current month? → Empty
  state should display gracefully in Category Breakdown.
- What happens when a category has no children? → Drill-down chevron should not
  appear; tapping should do nothing.
- What happens when all transactions are in the same currency? → Behaves
  identically to current implementation.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract `MonthlyExpenseChart` from `stats.tsx` into a
  dedicated file `components/stats/MonthlyExpenseChart.tsx`.
- **FR-002**: System MUST extract `QuickStats` from `stats.tsx` into a dedicated
  file `components/stats/QuickStats.tsx`.
- **FR-003**: System MUST extract `Breadcrumbs` and `CategoryListItem` from
  `CategoryDrilldownCard.tsx` into their own files under `components/stats/`.
- **FR-004**: System MUST extract types (`CategoryData`, `BreadcrumbItem`) and
  constants (`CHART_COLORS`) into separate files under `components/stats/`.
- **FR-005**: System MUST extract the `getYearMonthBoundaries` helper to a
  shared utilities location.
- **FR-006**: System MUST replace all `isDark` ternary expressions in refactored
  components with Tailwind `dark:` variants, except where the chart library API
  requires programmatic colour values.
- **FR-007**: System MUST replace hardcoded `currency: "EGP"` with the
  transaction's actual currency property in all `formatCurrency` calls.
- **FR-008**: The `CategoryDrilldownCard` MUST remain expense-only
  (`Q.where("type", "EXPENSE")`).
- **FR-009**: The `stats.tsx` screen file MUST only compose extracted components
  — no inline component definitions.
- **FR-010**: System MUST preserve the existing `useAllCategories()` context
  integration in `CategoryDrilldownCard` (no regression to own DB subscription).

### Key Entities

- **CategoryData**: Computed aggregate data per category (amount, percentage,
  colour, children). Internal to drilldown logic.
- **BreadcrumbItem**: Navigation state for drill-down hierarchy.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `stats.tsx` is reduced from ~281 lines to under 50 lines
  (composition only).
- **SC-002**: `CategoryDrilldownCard.tsx` is reduced from ~448 lines to under
  200 lines.
- **SC-003**: Zero `isDark` ternary expressions remain in the refactored
  component files (chart library interop excluded).
- **SC-004**: Zero hardcoded `"EGP"` strings remain in any stats-related
  component.
- **SC-005**: ESLint passes with 0 errors across all modified files.
- **SC-006**: The Stats tab renders identically before and after refactoring
  (visual parity).
