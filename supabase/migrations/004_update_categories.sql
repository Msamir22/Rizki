-- =============================================================================
-- Migration: 004_update_categories
-- Description: Update category structure with new L1 Travel category,
--              add new subcategories, and assign unique colors
-- =============================================================================

-- =============================================================================
-- SECTION 1: ADD COLOR COLUMN IF NOT EXISTS
-- =============================================================================

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#9CA3AF';

-- =============================================================================
-- SECTION 2: ADD NEW L1 TRAVEL CATEGORY
-- =============================================================================

-- Insert Travel as L1 category (ID 14)
INSERT INTO public.categories (id, user_id, parent_id, system_name, display_name, icon, level, nature, type, is_system, sort_order)
VALUES ('00000000-0000-0000-0001-000000000014', NULL, NULL, 'travel', 'Travel', '✈️', 1, 'WANT', 'EXPENSE', true, 11)
ON CONFLICT (id) DO UPDATE SET 
  system_name = EXCLUDED.system_name,
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon,
  nature = EXCLUDED.nature,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;

-- =============================================================================
-- SECTION 3: ADD TRAVEL L2 SUBCATEGORIES
-- =============================================================================

INSERT INTO public.categories (user_id, parent_id, system_name, display_name, icon, level, nature, type, is_system, sort_order) VALUES
  (NULL, '00000000-0000-0000-0001-000000000014', 'vacation', 'Vacation', '🏖️', 2, 'WANT', 'EXPENSE', true, 1),
  (NULL, '00000000-0000-0000-0001-000000000014', 'business_travel', 'Business Travel', '💼', 2, 'WANT', 'EXPENSE', true, 2),
  (NULL, '00000000-0000-0000-0001-000000000014', 'holiday', 'Holiday', '🎄', 2, 'WANT', 'EXPENSE', true, 3),
  (NULL, '00000000-0000-0000-0001-000000000014', 'travel_other', 'Other', '✈️', 2, NULL, 'EXPENSE', true, 99)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 4: ADD MISSING SHOPPING SUBCATEGORY
-- =============================================================================

-- Add Personal Care to Shopping subcategories
INSERT INTO public.categories (user_id, parent_id, system_name, display_name, icon, level, nature, type, is_system, sort_order)
VALUES (NULL, '00000000-0000-0000-0001-000000000004', 'personal_care', 'Personal Care', '💆', 2, 'WANT', 'EXPENSE', true, 16)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 5: ADD MISSING INCOME SUBCATEGORIES
-- =============================================================================

-- Add Freelance and Business Income subcategories
INSERT INTO public.categories (user_id, parent_id, system_name, display_name, icon, level, nature, type, is_system, sort_order) VALUES
  (NULL, '00000000-0000-0000-0001-000000000012', 'freelance', 'Freelance', '💼', 2, NULL, 'INCOME', true, 9),
  (NULL, '00000000-0000-0000-0001-000000000012', 'business_income', 'Business Income', '🏢', 2, NULL, 'INCOME', true, 10)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 6: UPDATE L1 CATEGORY COLORS
-- =============================================================================

-- Expense L1 Categories - each with unique color
UPDATE categories SET color = '#F59E0B' WHERE system_name = 'food_drinks' AND level = 1;
UPDATE categories SET color = '#3B82F6' WHERE system_name = 'transportation' AND level = 1;
UPDATE categories SET color = '#8B5CF6' WHERE system_name = 'vehicle' AND level = 1;
UPDATE categories SET color = '#EC4899' WHERE system_name = 'shopping' AND level = 1;
UPDATE categories SET color = '#EF4444' WHERE system_name = 'health_medical' AND level = 1;
UPDATE categories SET color = '#6366F1' WHERE system_name = 'utilities_bills' AND level = 1;
UPDATE categories SET color = '#14B8A6' WHERE system_name = 'entertainment' AND level = 1;
UPDATE categories SET color = '#F472B6' WHERE system_name = 'charity' AND level = 1;
UPDATE categories SET color = '#F97316' WHERE system_name = 'education' AND level = 1;
UPDATE categories SET color = '#A855F7' WHERE system_name = 'housing' AND level = 1;
UPDATE categories SET color = '#06B6D4' WHERE system_name = 'travel' AND level = 1;
UPDATE categories SET color = '#6B7280' WHERE system_name = 'debt_loans' AND level = 1;
UPDATE categories SET color = '#9CA3AF' WHERE system_name = 'other' AND level = 1;

-- Income L1 Category
UPDATE categories SET color = '#10B981' WHERE system_name = 'income' AND level = 1;

-- Internal Categories
UPDATE categories SET color = '#374151' WHERE system_name = 'asset_purchase' AND level = 1;
UPDATE categories SET color = '#374151' WHERE system_name = 'asset_sale' AND level = 1;

-- =============================================================================
-- SECTION 7: UPDATE L2 SUBCATEGORY COLORS
-- =============================================================================

-- Food & Drinks Subcategories
UPDATE categories SET color = '#FCD34D' WHERE system_name = 'groceries';
UPDATE categories SET color = '#FBBF24' WHERE system_name = 'restaurant';
UPDATE categories SET color = '#B45309' WHERE system_name = 'coffee_tea';
UPDATE categories SET color = '#D97706' WHERE system_name = 'snacks';
UPDATE categories SET color = '#F59E0B' WHERE system_name = 'drinks';
UPDATE categories SET color = '#92400E' WHERE system_name = 'food_other';

-- Transportation Subcategories
UPDATE categories SET color = '#60A5FA' WHERE system_name = 'public_transport';
UPDATE categories SET color = '#3B82F6' WHERE system_name = 'private_transport';
UPDATE categories SET color = '#1D4ED8' WHERE system_name = 'transport_other';

-- Vehicle Subcategories
UPDATE categories SET color = '#A78BFA' WHERE system_name = 'fuel';
UPDATE categories SET color = '#8B5CF6' WHERE system_name = 'parking';
UPDATE categories SET color = '#7C3AED' WHERE system_name = 'rental';
UPDATE categories SET color = '#6D28D9' WHERE system_name = 'license_fees';
UPDATE categories SET color = '#5B21B6' WHERE system_name = 'vehicle_tax';
UPDATE categories SET color = '#4C1D95' WHERE system_name = 'traffic_fine';
UPDATE categories SET color = '#C4B5FD' WHERE system_name = 'vehicle_buy';
UPDATE categories SET color = '#DDD6FE' WHERE system_name = 'vehicle_sell';
UPDATE categories SET color = '#9333EA' WHERE system_name = 'vehicle_maintenance';
UPDATE categories SET color = '#581C87' WHERE system_name = 'vehicle_other';

-- Shopping Subcategories
UPDATE categories SET color = '#F472B6' WHERE system_name = 'clothes';
UPDATE categories SET color = '#EC4899' WHERE system_name = 'electronics_appliances';
UPDATE categories SET color = '#DB2777' WHERE system_name = 'accessories';
UPDATE categories SET color = '#BE185D' WHERE system_name = 'footwear';
UPDATE categories SET color = '#9D174D' WHERE system_name = 'bags';
UPDATE categories SET color = '#831843' WHERE system_name = 'kids_baby';
UPDATE categories SET color = '#FBCFE8' WHERE system_name = 'beauty';
UPDATE categories SET color = '#F9A8D4' WHERE system_name = 'home_garden';
UPDATE categories SET color = '#F0ABFC' WHERE system_name = 'pets';
UPDATE categories SET color = '#E879F9' WHERE system_name = 'sports_fitness';
UPDATE categories SET color = '#D946EF' WHERE system_name = 'toys_games';
UPDATE categories SET color = '#C026D3' WHERE system_name = 'wedding';
UPDATE categories SET color = '#A21CAF' WHERE system_name = 'detergents';
UPDATE categories SET color = '#86198F' WHERE system_name = 'decorations';
UPDATE categories SET color = '#701A75' WHERE system_name = 'personal_care';
UPDATE categories SET color = '#4A044E' WHERE system_name = 'shopping_other';

-- Health & Medical Subcategories
UPDATE categories SET color = '#FCA5A5' WHERE system_name = 'doctor';
UPDATE categories SET color = '#F87171' WHERE system_name = 'medicine';
UPDATE categories SET color = '#EF4444' WHERE system_name = 'surgery';
UPDATE categories SET color = '#DC2626' WHERE system_name = 'dental';
UPDATE categories SET color = '#B91C1C' WHERE system_name = 'health_other';

-- Utilities & Bills Subcategories
UPDATE categories SET color = '#818CF8' WHERE system_name = 'electricity';
UPDATE categories SET color = '#6366F1' WHERE system_name = 'water';
UPDATE categories SET color = '#4F46E5' WHERE system_name = 'internet';
UPDATE categories SET color = '#4338CA' WHERE system_name = 'phone';
UPDATE categories SET color = '#3730A3' WHERE system_name = 'gas';
UPDATE categories SET color = '#312E81' WHERE system_name = 'trash';
UPDATE categories SET color = '#A5B4FC' WHERE system_name = 'online_subscription';
UPDATE categories SET color = '#C7D2FE' WHERE system_name = 'streaming';
UPDATE categories SET color = '#E0E7FF' WHERE system_name = 'taxes';
UPDATE categories SET color = '#1E1B4B' WHERE system_name = 'utilities_other';

-- Entertainment Subcategories
UPDATE categories SET color = '#2DD4BF' WHERE system_name = 'events';
UPDATE categories SET color = '#14B8A6' WHERE system_name = 'tickets';
UPDATE categories SET color = '#0D9488' WHERE system_name = 'entertainment_other';

-- Charity Subcategories
UPDATE categories SET color = '#FDA4AF' WHERE system_name = 'donations';
UPDATE categories SET color = '#FB7185' WHERE system_name = 'fundraising';
UPDATE categories SET color = '#F43F5E' WHERE system_name = 'charity_gifts';
UPDATE categories SET color = '#E11D48' WHERE system_name = 'charity_other';

-- Education Subcategories
UPDATE categories SET color = '#FDBA74' WHERE system_name = 'books';
UPDATE categories SET color = '#FB923C' WHERE system_name = 'tuition';
UPDATE categories SET color = '#F97316' WHERE system_name = 'education_fees';
UPDATE categories SET color = '#EA580C' WHERE system_name = 'education_other';

-- Housing Subcategories
UPDATE categories SET color = '#C4B5FD' WHERE system_name = 'rent';
UPDATE categories SET color = '#A78BFA' WHERE system_name = 'housing_maintenance';
UPDATE categories SET color = '#8B5CF6' WHERE system_name = 'housing_tax';
UPDATE categories SET color = '#7C3AED' WHERE system_name = 'housing_buy';
UPDATE categories SET color = '#6D28D9' WHERE system_name = 'housing_sell';
UPDATE categories SET color = '#5B21B6' WHERE system_name = 'housing_other';

-- Travel Subcategories
UPDATE categories SET color = '#22D3EE' WHERE system_name = 'vacation';
UPDATE categories SET color = '#06B6D4' WHERE system_name = 'business_travel';
UPDATE categories SET color = '#0891B2' WHERE system_name = 'holiday';
UPDATE categories SET color = '#0E7490' WHERE system_name = 'travel_other';

-- Income Subcategories
UPDATE categories SET color = '#10B981' WHERE system_name = 'salary';
UPDATE categories SET color = '#059669' WHERE system_name = 'bonus';
UPDATE categories SET color = '#047857' WHERE system_name = 'commission';
UPDATE categories SET color = '#065F46' WHERE system_name = 'refund';
UPDATE categories SET color = '#064E3B' WHERE system_name = 'loan_income';
UPDATE categories SET color = '#22C55E' WHERE system_name = 'gift_income';
UPDATE categories SET color = '#16A34A' WHERE system_name = 'check';
UPDATE categories SET color = '#15803D' WHERE system_name = 'rental_income';
UPDATE categories SET color = '#166534' WHERE system_name = 'freelance';
UPDATE categories SET color = '#14532D' WHERE system_name = 'business_income';
UPDATE categories SET color = '#34D399' WHERE system_name = 'income_other';

-- Debt / Loans Subcategories
UPDATE categories SET color = '#9CA3AF' WHERE system_name = 'lent_money';
UPDATE categories SET color = '#6B7280' WHERE system_name = 'borrowed_money';
UPDATE categories SET color = '#4B5563' WHERE system_name = 'debt_repayment_paid';
UPDATE categories SET color = '#374151' WHERE system_name = 'debt_repayment_received';
UPDATE categories SET color = '#1F2937' WHERE system_name = 'debt_other';

-- Other (Fallback) Subcategory
UPDATE categories SET color = '#D1D5DB' WHERE system_name = 'uncategorized';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
