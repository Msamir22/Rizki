# Astik - Finalized Business Decisions

> **Status:** 🟢 Confirmed  
> **Last Updated:** 2026-01-01  
> **Purpose:** Single source of truth for all confirmed business decisions

---

## 1. User & Authentication

### 1.1 Authentication Methods

| Method              | Status         |
| ------------------- | -------------- |
| Email/Password      | ✅ Enabled     |
| Google Social Login | ✅ Enabled     |
| Apple Social Login  | ❌ Not planned |
| Phone OTP           | ❌ Not planned |

### 1.2 Guest Mode (Anonymous Authentication)

**Implementation:** Supabase Anonymous Authentication with WatermelonDB
offline-first

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. FIRST APP LAUNCH                                                    │
│     └─→ signInAnonymously() → Supabase creates "Ghost ID" (user_123)    │
│                                                                          │
│  2. USER ADDS DATA                                                       │
│     └─→ Saved to WatermelonDB (instant) → Syncs to Supabase (background)│
│                                                                          │
│  3. SIGN-UP PROMPT                                                       │
│     └─→ Triggered after 5 transactions                                  │
│     └─→ User can continue indefinitely without signing up               │
│                                                                          │
│  4. ACCOUNT CONVERSION                                                   │
│     └─→ updateUser({ email, password }) → Attaches credentials          │
│     └─→ NO data migration needed (same user_id)                         │
│                                                                          │
│  5. DEVICE LOSS (Guest)                                                  │
│     └─→ Data exists in Supabase but ACCESS IS LOST (no credentials)     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 User Profile Fields

| Field        | Required              | Notes                         |
| ------------ | --------------------- | ----------------------------- |
| `id` (UUID)  | ✅                    | Supabase auth.users           |
| `email`      | Only after conversion | Anonymous users have no email |
| `name`       | 🟡 TBD                | Display name for greeting     |
| `avatar_url` | 🟡 TBD                | From Google profile?          |

---

## 2. Database Architecture

### 2.1 Design Pattern

**Supertype/Subtype (Polymorphic) Pattern**

Separates data into two distinct domains:

- **Accounts Domain:** Liquid, spendable money (transactions flow here)
- **Assets Domain:** Investments, net worth tracking (value calculated from
  market rates)

### 2.2 Accounts Domain (Spendable Money)

#### Table: `accounts`

Parent table for all liquid money containers.

| Column       | Type        | Required | Description                                  |
| ------------ | ----------- | -------- | -------------------------------------------- |
| `id`         | UUID        | ✅       | Primary Key                                  |
| `user_id`    | UUID        | ✅       | FK → auth.users                              |
| `name`       | TEXT        | ✅       | User-defined name (e.g., "Main CIB Account") |
| `type`       | ENUM        | ✅       | `'CASH'`, `'BANK'`, `'DIGITAL_WALLET'`       |
| `balance`    | DECIMAL     | ✅       | Current available money                      |
| `currency`   | CHAR(3)     | ✅       | ISO code: `'EGP'`, `'USD'`, `'EUR'`          |
| `created_at` | TIMESTAMPTZ | ✅       | Auto-generated                               |
| `updated_at` | TIMESTAMPTZ | ✅       | For WatermelonDB sync                        |
| `deleted`    | BOOLEAN     | ✅       | Soft delete for sync (default: false)        |

**Business Rules:**

- One account = one currency
- Same name can exist with different currencies (e.g., "CIB USD", "CIB EGP")
- Balance updated automatically when transactions are added

#### Table: `bank_details`

Child table for accounts where `type = 'BANK'`. 1-to-Many (one bank account can
have multiple cards).

| Column            | Type        | Required | Description                            |
| ----------------- | ----------- | -------- | -------------------------------------- |
| `id`              | UUID        | ✅       | Primary Key                            |
| `account_id`      | UUID        | ✅       | FK → accounts.id                       |
| `bank_name`       | TEXT        | ✅       | e.g., "HSBC", "National Bank of Egypt" |
| `card_last_4`     | VARCHAR(4)  | ✅       | For SMS auto-detection                 |
| `sms_sender_name` | TEXT        | ❓       | e.g., "AhlyBank" (for SMS parsing)     |
| `account_number`  | TEXT        | ❌       | Optional IBAN                          |
| `created_at`      | TIMESTAMPTZ | ✅       | Auto-generated                         |

### 2.3 Assets Domain (Wealth & Investments)

#### Table: `assets`

Parent table for all investment holdings.

| Column           | Type        | Required | Description                                  |
| ---------------- | ----------- | -------- | -------------------------------------------- |
| `id`             | UUID        | ✅       | Primary Key                                  |
| `user_id`        | UUID        | ✅       | FK → auth.users                              |
| `name`           | TEXT        | ✅       | User-defined name (e.g., "My Wedding Gold")  |
| `type`           | ENUM        | ✅       | `'METAL'`, `'CRYPTO'`, `'REAL_ESTATE'`       |
| `is_liquid`      | BOOLEAN     | ✅       | Can be sold instantly? (emergency fund calc) |
| `purchase_price` | DECIMAL     | ✅       | Cost basis (total paid)                      |
| `purchase_date`  | DATE        | ✅       | When acquired                                |
| `currency`       | CHAR(3)     | ✅       | Currency used to purchase                    |
| `notes`          | TEXT        | ❌       | Optional user notes                          |
| `created_at`     | TIMESTAMPTZ | ✅       | Auto-generated                               |
| `updated_at`     | TIMESTAMPTZ | ✅       | For WatermelonDB sync                        |
| `deleted`        | BOOLEAN     | ✅       | Soft delete for sync                         |

**Note:** `current_value` is NOT stored. It's calculated:

- Metals: `weight_grams * live_market_rate`
- Crypto: 🟡 TBD (future)
- Real Estate: 🟡 TBD (future, possibly manual entry)

#### Table: `asset_metals`

Child table for assets where `type = 'METAL'`.

| Column         | Type        | Required | Description                        |
| -------------- | ----------- | -------- | ---------------------------------- |
| `id`           | UUID        | ✅       | Primary Key                        |
| `asset_id`     | UUID        | ✅       | FK → assets.id                     |
| `metal_type`   | ENUM        | ✅       | `'GOLD'`, `'SILVER'`, `'PLATINUM'` |
| `weight_grams` | DECIMAL     | ✅       | Physical weight                    |
| `purity_karat` | SMALLINT    | ✅       | 24 for pure gold, 21, 18, etc.     |
| `item_form`    | TEXT        | ❌       | "Coin", "Bar", "Jewelry"           |
| `created_at`   | TIMESTAMPTZ | ✅       | Auto-generated                     |

**Valuation Formula:**
`current_value = weight_grams * (purity_karat / 24) * live_gold_price_per_gram`

### 2.4 Historical Snapshots

#### Table: `daily_snapshot_balance`

Stores end-of-day account balances for charts and trends.

| Column               | Type        | Description                          |
| -------------------- | ----------- | ------------------------------------ |
| `id`                 | UUID        | Primary Key                          |
| `user_id`            | UUID        | FK → auth.users                      |
| `snapshot_date`      | DATE        | The date of snapshot                 |
| `total_accounts_egp` | DECIMAL     | Sum of all accounts converted to EGP |
| `breakdown`          | JSONB       | Per-account breakdown                |
| `created_at`         | TIMESTAMPTZ | Auto-generated                       |

**Trigger:** Daily at 11 PM

#### Table: `daily_snapshot_assets`

Stores end-of-day asset valuations.

| Column             | Type        | Description                        |
| ------------------ | ----------- | ---------------------------------- |
| `id`               | UUID        | Primary Key                        |
| `user_id`          | UUID        | FK → auth.users                    |
| `snapshot_date`    | DATE        | The date of snapshot               |
| `total_assets_egp` | DECIMAL     | Sum of all assets converted to EGP |
| `breakdown`        | JSONB       | Per-asset breakdown with values    |
| `created_at`       | TIMESTAMPTZ | Auto-generated                     |

**Trigger:** Daily at 11 PM

### 2.5 Market Rates

#### Table: `market_rates` (existing)

Current live rates (single row, updated every 30 mins).

#### Table: `market_rates_history` (new)

Historical rates for trend calculation.

| Column                | Type        | Description                |
| --------------------- | ----------- | -------------------------- |
| `id`                  | UUID        | Primary Key                |
| `snapshot_date`       | DATE        | Unique per day             |
| `gold_egp_per_gram`   | DECIMAL     | Gold price at end of day   |
| `silver_egp_per_gram` | DECIMAL     | Silver price at end of day |
| `usd_egp`             | DECIMAL     | USD/EGP rate               |
| `eur_egp`             | DECIMAL     | EUR/EGP rate               |
| `created_at`          | TIMESTAMPTZ | Auto-generated             |

**Trigger:** Daily at 11 PM

---

## 3. Multi-Currency Handling

| Scenario                        | Behavior                                                 |
| ------------------------------- | -------------------------------------------------------- |
| One bank, multiple currencies   | Create separate account per currency (same name allowed) |
| Transaction in foreign currency | Transaction stored in account's currency                 |
| Total balance display           | Convert all to EGP using live rates                      |
| Supported currencies            | EGP, USD, EUR                                            |

---

## 4. Sync Strategy

### 4.1 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │ ←───│ WatermelonDB│ ←───│   Supabase  │
│   (UI)      │     │  (Local)    │     │   (Cloud)   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │ push_changes() / pull_changes()
                          ▼
                    ┌─────────────┐
                    │  Supabase   │
                    │    RPC      │
                    └─────────────┘
```

### 4.2 Sync Columns (All Tables)

- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted` (BOOLEAN, default false)
- `user_id` (UUID, set from auth.uid())

### 4.3 RLS Policies

All tables: `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE

---

## 5. Transaction Categories

### 5.1 Category Architecture

**Design:** 3-level hierarchical category system with predefined + user-defined
categories.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CATEGORY HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Level 1 (Main Category)     Level 2 (Subcategory)    Level 3 (Sub-sub)     │
│  ────────────────────────    ────────────────────     ─────────────────     │
│                                                                              │
│  Food & Drinks           →   Drinks               →   Juice, Soda, etc.     │
│  [SYSTEM, Required]          [SYSTEM, Required]       [USER, Optional]      │
│                                                                              │
│  My Custom Category      →   Custom Sub           →   Custom Detail         │
│  [USER, Editable]            [USER, Editable]         [USER, Editable]      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Business Rules

| Rule                                 | Description                                                           |
| ------------------------------------ | --------------------------------------------------------------------- |
| **L1 & L2 Predefined**               | System categories are read-only (cannot edit name/icon/delete)        |
| **L3 User-defined Only**             | No predefined L3 categories; all are user-created                     |
| **User Custom Categories**           | Users can add custom L1, L2, L3 categories                            |
| **User Categories Editable**         | Only user-created categories can have name/icon changed or be deleted |
| **System Categories Locked**         | System category names and icons cannot be modified by users           |
| **Hide Any Level**                   | Users can hide any category (system or custom) from their list        |
| **Transactions Reference Any Level** | Transactions can link to L1, L2, or L3 (user's choice)                |

### 5.3 Table: `categories`

Self-referential table for all category levels.

| Column         | Type        | Required | Description                                                           |
| -------------- | ----------- | -------- | --------------------------------------------------------------------- |
| `id`           | UUID        | ✅       | Primary Key                                                           |
| `user_id`      | UUID        | ❌       | NULL for system categories, set for user-created                      |
| `parent_id`    | UUID        | ❌       | FK → categories.id (NULL for L1)                                      |
| `system_name`  | TEXT        | ✅       | Internal identifier (immutable, lowercase_snake)                      |
| `display_name` | TEXT        | ✅       | User-visible name (editable only for custom)                          |
| `icon`         | TEXT        | ✅       | Icon identifier from predefined set                                   |
| `level`        | SMALLINT    | ✅       | 1, 2, or 3                                                            |
| `nature`       | ENUM        | ⚠️       | `'WANT'`, `'NEED'`, `'MUST'` (required for system, optional for user) |
| `type`         | ENUM        | ✅       | `'EXPENSE'`, `'INCOME'` (determines transaction direction)            |
| `is_system`    | BOOLEAN     | ✅       | true = predefined, false = user-created                               |
| `is_hidden`    | BOOLEAN     | ✅       | User can hide any category (default: false)                           |
| `sort_order`   | SMALLINT    | ❌       | Display order within parent                                           |
| `created_at`   | TIMESTAMPTZ | ✅       | Auto-generated                                                        |
| `updated_at`   | TIMESTAMPTZ | ✅       | For WatermelonDB sync                                                 |
| `deleted`      | BOOLEAN     | ✅       | Soft delete for sync (default: false)                                 |

**Constraints:**

- `parent_id` required when `level > 1`
- `user_id` required when `is_system = false`
- Unique: `(user_id, parent_id, system_name)` — prevents duplicates per user

### 5.4 Table: `user_category_settings`

Per-user settings for system categories (visibility and nature override).

| Column        | Type        | Required | Description                                   |
| ------------- | ----------- | -------- | --------------------------------------------- |
| `id`          | UUID        | ✅       | Primary Key                                   |
| `user_id`     | UUID        | ✅       | FK → auth.users                               |
| `category_id` | UUID        | ✅       | FK → categories.id (system category)          |
| `is_hidden`   | BOOLEAN     | ✅       | Hide this system category (default: false)    |
| `nature`      | ENUM        | ❌       | User's override: `'WANT'`, `'NEED'`, `'MUST'` |
| `created_at`  | TIMESTAMPTZ | ✅       | Auto-generated                                |
| `updated_at`  | TIMESTAMPTZ | ✅       | For WatermelonDB sync                         |

**Note:** This table allows users to hide system categories and override their
`nature` value. System category names and icons remain locked. User-created
categories store all settings directly in the `categories` table.

### 5.5 Predefined Categories (Seed Data)

#### Level 1: Main Categories

| system_name       | display_name      | type    | icon |
| ----------------- | ----------------- | ------- | ---- |
| `food_drinks`     | Food & Drinks     | EXPENSE | 🍔   |
| `transportation`  | Transportation    | EXPENSE | 🚌   |
| `vehicle`         | Vehicle           | EXPENSE | 🚗   |
| `shopping`        | Shopping          | EXPENSE | 🛒   |
| `health_medical`  | Health & Medical  | EXPENSE | 🏥   |
| `utilities_bills` | Utilities & Bills | EXPENSE | 📄   |
| `entertainment`   | Entertainment     | EXPENSE | 🎉   |
| `charity`         | Charity           | EXPENSE | ❤️   |
| `education`       | Education         | EXPENSE | 📚   |
| `housing`         | Housing           | EXPENSE | 🏠   |
| `income`          | Salary / Income   | INCOME  | 💰   |
| `other`           | Other             | EXPENSE | ❓   |

#### Level 2: Subcategories

<details>
<summary><b>Food & Drinks</b></summary>

| system_name  | display_name |
| ------------ | ------------ |
| `groceries`  | Groceries    |
| `restaurant` | Restaurant   |
| `coffee_tea` | Coffee & Tea |
| `snacks`     | Snacks       |
| `drinks`     | Drinks       |
| `food_other` | Other        |

</details>

<details>
<summary><b>Transportation</b></summary>

| system_name         | display_name      |
| ------------------- | ----------------- |
| `public_transport`  | Public Transport  |
| `private_transport` | Private Transport |
| `transport_other`   | Other             |

</details>

<details>
<summary><b>Vehicle</b></summary>

| system_name           | display_name | Notes                        |
| --------------------- | ------------ | ---------------------------- |
| `fuel`                | Fuel         |                              |
| `parking`             | Parking      |                              |
| `rental`              | Rental       |                              |
| `license_fees`        | License Fees |                              |
| `vehicle_tax`         | Tax          |                              |
| `traffic_fine`        | Traffic Fine |                              |
| `vehicle_buy`         | Buy          | 🟡 Future: migrate to assets |
| `vehicle_sell`        | Sell         | 🟡 Future: migrate to assets |
| `vehicle_maintenance` | Maintenance  |                              |
| `vehicle_other`       | Other        |                              |

</details>

<details>
<summary><b>Shopping</b></summary>

| system_name              | display_name             |
| ------------------------ | ------------------------ |
| `clothes`                | Clothes                  |
| `electronics_appliances` | Electronics & Appliances |
| `accessories`            | Accessories              |
| `footwear`               | Footwear                 |
| `bags`                   | Bags                     |
| `kids_baby`              | Kids & Baby              |
| `beauty`                 | Beauty                   |
| `home_garden`            | Home & Garden            |
| `pets`                   | Pets                     |
| `sports_fitness`         | Sports & Fitness         |
| `toys_games`             | Toys & Games             |
| `travel`                 | Travel                   |
| `wedding`                | Wedding                  |
| `detergents`             | Detergents               |
| `decorations`            | Decorations              |
| `shopping_other`         | Other                    |

</details>

<details>
<summary><b>Health & Medical</b></summary>

| system_name    | display_name |
| -------------- | ------------ |
| `doctor`       | Doctor       |
| `medicine`     | Medicine     |
| `surgery`      | Surgery      |
| `dental`       | Dental       |
| `health_other` | Other        |

</details>

<details>
<summary><b>Utilities & Bills</b></summary>

| system_name           | display_name        |
| --------------------- | ------------------- |
| `electricity`         | Electricity         |
| `water`               | Water               |
| `internet`            | Internet            |
| `phone`               | Phone               |
| `gas`                 | Gas                 |
| `trash`               | Trash               |
| `online_subscription` | Online Subscription |
| `streaming`           | Streaming           |
| `taxes`               | Taxes               |
| `utilities_other`     | Other               |

</details>

<details>
<summary><b>Entertainment</b></summary>

| system_name           | display_name     |
| --------------------- | ---------------- |
| `trips_holidays`      | Trips & Holidays |
| `events`              | Events           |
| `tickets`             | Tickets          |
| `entertainment_other` | Other            |

</details>

<details>
<summary><b>Charity</b></summary>

| system_name     | display_name |
| --------------- | ------------ |
| `donations`     | Donations    |
| `fundraising`   | Fundraising  |
| `charity_gifts` | Gifts        |
| `charity_other` | Other        |

</details>

<details>
<summary><b>Education</b></summary>

| system_name       | display_name |
| ----------------- | ------------ |
| `books`           | Books        |
| `tuition`         | Tuition      |
| `education_fees`  | Fees         |
| `education_other` | Other        |

</details>

<details>
<summary><b>Housing</b></summary>

| system_name           | display_name          | Notes                        |
| --------------------- | --------------------- | ---------------------------- |
| `rent`                | Rent                  |                              |
| `housing_maintenance` | Maintenance & Repairs |                              |
| `housing_tax`         | Tax                   |                              |
| `housing_buy`         | Buy                   | 🟡 Future: migrate to assets |
| `housing_sell`        | Sell                  | 🟡 Future: migrate to assets |
| `housing_other`       | Other                 |                              |

</details>

<details>
<summary><b>Salary / Income</b></summary>

| system_name     | display_name  |
| --------------- | ------------- |
| `salary`        | Salary        |
| `bonus`         | Bonus         |
| `commission`    | Commission    |
| `refund`        | Refund        |
| `loan_income`   | Loan          |
| `gift_income`   | Gift          |
| `check`         | Check         |
| `rental_income` | Rental Income |
| `income_other`  | Other         |

</details>

<details>
<summary><b>Other (Fallback)</b></summary>

| system_name     | display_name |
| --------------- | ------------ |
| `uncategorized` | Other        |

</details>

---

## 6. Pending Questions

See `business-discovery.md` for remaining questions about:

- Transactions (types, recurring)
- Budgets
- Transfers
- Notifications
- And more...
