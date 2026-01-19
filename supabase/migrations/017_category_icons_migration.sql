-- =============================================================================
-- Migration: 017_category_icons_migration
-- Description: Add icon_library column and update emoji icons to vector icon names
-- =============================================================================

-- =============================================================================
-- SECTION 1: ADD ICON_LIBRARY COLUMN
-- =============================================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_library TEXT NOT NULL DEFAULT 'Ionicons';

-- =============================================================================
-- SECTION 2: UPDATE L1 CATEGORIES - ICONS FROM EMOJI TO VECTOR NAMES
-- =============================================================================

-- Food & Drinks
UPDATE categories SET icon = 'fast-food', icon_library = 'Ionicons' WHERE system_name = 'food_drinks' AND level = 1;

-- Transportation
UPDATE categories SET icon = 'car', icon_library = 'Ionicons' WHERE system_name = 'transportation' AND level = 1;

-- Vehicle
UPDATE categories SET icon = 'car-sport', icon_library = 'Ionicons' WHERE system_name = 'vehicle' AND level = 1;

-- Shopping
UPDATE categories SET icon = 'cart', icon_library = 'Ionicons' WHERE system_name = 'shopping' AND level = 1;

-- Health & Medical
UPDATE categories SET icon = 'medkit', icon_library = 'Ionicons' WHERE system_name = 'health_medical' AND level = 1;

-- Utilities & Bills
UPDATE categories SET icon = 'flash', icon_library = 'Ionicons' WHERE system_name = 'utilities_bills' AND level = 1;

-- Entertainment
UPDATE categories SET icon = 'game-controller', icon_library = 'Ionicons' WHERE system_name = 'entertainment' AND level = 1;

-- Charity
UPDATE categories SET icon = 'heart', icon_library = 'Ionicons' WHERE system_name = 'charity' AND level = 1;

-- Education
UPDATE categories SET icon = 'school', icon_library = 'Ionicons' WHERE system_name = 'education' AND level = 1;

-- Housing
UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'housing' AND level = 1;

-- Travel
UPDATE categories SET icon = 'airplane', icon_library = 'Ionicons' WHERE system_name = 'travel' AND level = 1;

-- Debt / Loans
UPDATE categories SET icon = 'swap-horizontal', icon_library = 'Ionicons' WHERE system_name = 'debt_loans' AND level = 1;

-- Other (Fallback)
UPDATE categories SET icon = 'ellipsis-horizontal', icon_library = 'Ionicons' WHERE system_name = 'other' AND level = 1;

-- Income
UPDATE categories SET icon = 'wallet', icon_library = 'Ionicons' WHERE system_name = 'income' AND level = 1;

-- Internal Categories
UPDATE categories SET icon = 'cube', icon_library = 'Ionicons' WHERE system_name = 'asset_purchase' AND level = 1;
UPDATE categories SET icon = 'cash', icon_library = 'Ionicons' WHERE system_name = 'asset_sale' AND level = 1;

-- =============================================================================
-- SECTION 3: UPDATE L2 FOOD & DRINKS SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'basket', icon_library = 'Ionicons' WHERE system_name = 'groceries';
UPDATE categories SET icon = 'restaurant', icon_library = 'Ionicons' WHERE system_name = 'restaurant';
UPDATE categories SET icon = 'cafe', icon_library = 'Ionicons' WHERE system_name = 'coffee_tea';
UPDATE categories SET icon = 'pizza', icon_library = 'Ionicons' WHERE system_name = 'snacks';
UPDATE categories SET icon = 'beer', icon_library = 'Ionicons' WHERE system_name = 'drinks';
UPDATE categories SET icon = 'fast-food', icon_library = 'Ionicons' WHERE system_name = 'food_other';

-- =============================================================================
-- SECTION 4: UPDATE L2 TRANSPORTATION SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'bus', icon_library = 'Ionicons' WHERE system_name = 'public_transport';
UPDATE categories SET icon = 'car', icon_library = 'Ionicons' WHERE system_name = 'private_transport';
UPDATE categories SET icon = 'walk', icon_library = 'Ionicons' WHERE system_name = 'transport_other';

-- =============================================================================
-- SECTION 5: UPDATE L2 VEHICLE SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'flame', icon_library = 'Ionicons' WHERE system_name = 'fuel';
UPDATE categories SET icon = 'location', icon_library = 'Ionicons' WHERE system_name = 'parking';
UPDATE categories SET icon = 'key', icon_library = 'Ionicons' WHERE system_name = 'rental';
UPDATE categories SET icon = 'document-text', icon_library = 'Ionicons' WHERE system_name = 'license_fees';
UPDATE categories SET icon = 'receipt', icon_library = 'Ionicons' WHERE system_name = 'vehicle_tax';
UPDATE categories SET icon = 'warning', icon_library = 'Ionicons' WHERE system_name = 'traffic_fine';
UPDATE categories SET icon = 'car-sport', icon_library = 'Ionicons' WHERE system_name = 'vehicle_buy';
UPDATE categories SET icon = 'cash', icon_library = 'Ionicons' WHERE system_name = 'vehicle_sell';
UPDATE categories SET icon = 'construct', icon_library = 'Ionicons' WHERE system_name = 'vehicle_maintenance';
UPDATE categories SET icon = 'car', icon_library = 'Ionicons' WHERE system_name = 'vehicle_other';

-- =============================================================================
-- SECTION 6: UPDATE L2 SHOPPING SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'shirt', icon_library = 'Ionicons' WHERE system_name = 'clothes';
UPDATE categories SET icon = 'phone-portrait', icon_library = 'Ionicons' WHERE system_name = 'electronics_appliances';
UPDATE categories SET icon = 'watch', icon_library = 'Ionicons' WHERE system_name = 'accessories';
UPDATE categories SET icon = 'footsteps', icon_library = 'Ionicons' WHERE system_name = 'footwear';
UPDATE categories SET icon = 'briefcase', icon_library = 'Ionicons' WHERE system_name = 'bags';
UPDATE categories SET icon = 'happy', icon_library = 'Ionicons' WHERE system_name = 'kids_baby';
UPDATE categories SET icon = 'sparkles', icon_library = 'Ionicons' WHERE system_name = 'beauty';
UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'home_garden';
UPDATE categories SET icon = 'paw', icon_library = 'Ionicons' WHERE system_name = 'pets';
UPDATE categories SET icon = 'fitness', icon_library = 'Ionicons' WHERE system_name = 'sports_fitness';
UPDATE categories SET icon = 'game-controller', icon_library = 'Ionicons' WHERE system_name = 'toys_games';
UPDATE categories SET icon = 'heart', icon_library = 'Ionicons' WHERE system_name = 'wedding';
UPDATE categories SET icon = 'water', icon_library = 'Ionicons' WHERE system_name = 'detergents';
UPDATE categories SET icon = 'color-palette', icon_library = 'Ionicons' WHERE system_name = 'decorations';
UPDATE categories SET icon = 'person', icon_library = 'Ionicons' WHERE system_name = 'personal_care';
UPDATE categories SET icon = 'bag', icon_library = 'Ionicons' WHERE system_name = 'shopping_other';

-- =============================================================================
-- SECTION 7: UPDATE L2 HEALTH & MEDICAL SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'person', icon_library = 'Ionicons' WHERE system_name = 'doctor';
UPDATE categories SET icon = 'medical', icon_library = 'Ionicons' WHERE system_name = 'medicine';
UPDATE categories SET icon = 'bandage', icon_library = 'Ionicons' WHERE system_name = 'surgery';
UPDATE categories SET icon = 'happy', icon_library = 'Ionicons' WHERE system_name = 'dental';
UPDATE categories SET icon = 'medkit', icon_library = 'Ionicons' WHERE system_name = 'health_other';

-- =============================================================================
-- SECTION 8: UPDATE L2 UTILITIES & BILLS SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'flash', icon_library = 'Ionicons' WHERE system_name = 'electricity';
UPDATE categories SET icon = 'water', icon_library = 'Ionicons' WHERE system_name = 'water';
UPDATE categories SET icon = 'wifi', icon_library = 'Ionicons' WHERE system_name = 'internet';
UPDATE categories SET icon = 'call', icon_library = 'Ionicons' WHERE system_name = 'phone';
UPDATE categories SET icon = 'flame', icon_library = 'Ionicons' WHERE system_name = 'gas';
UPDATE categories SET icon = 'trash', icon_library = 'Ionicons' WHERE system_name = 'trash';
UPDATE categories SET icon = 'globe', icon_library = 'Ionicons' WHERE system_name = 'online_subscription';
UPDATE categories SET icon = 'tv', icon_library = 'Ionicons' WHERE system_name = 'streaming';
UPDATE categories SET icon = 'document', icon_library = 'Ionicons' WHERE system_name = 'taxes';
UPDATE categories SET icon = 'document-text', icon_library = 'Ionicons' WHERE system_name = 'utilities_other';

-- =============================================================================
-- SECTION 9: UPDATE L2 ENTERTAINMENT SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'sunny', icon_library = 'Ionicons' WHERE system_name = 'trips_holidays';
UPDATE categories SET icon = 'calendar', icon_library = 'Ionicons' WHERE system_name = 'events';
UPDATE categories SET icon = 'ticket', icon_library = 'Ionicons' WHERE system_name = 'tickets';
UPDATE categories SET icon = 'game-controller', icon_library = 'Ionicons' WHERE system_name = 'entertainment_other';

-- =============================================================================
-- SECTION 10: UPDATE L2 CHARITY SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'heart', icon_library = 'Ionicons' WHERE system_name = 'donations';
UPDATE categories SET icon = 'people', icon_library = 'Ionicons' WHERE system_name = 'fundraising';
UPDATE categories SET icon = 'gift', icon_library = 'Ionicons' WHERE system_name = 'charity_gifts';
UPDATE categories SET icon = 'heart', icon_library = 'Ionicons' WHERE system_name = 'charity_other';

-- =============================================================================
-- SECTION 11: UPDATE L2 EDUCATION SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'book', icon_library = 'Ionicons' WHERE system_name = 'books';
UPDATE categories SET icon = 'school', icon_library = 'Ionicons' WHERE system_name = 'tuition';
UPDATE categories SET icon = 'receipt', icon_library = 'Ionicons' WHERE system_name = 'education_fees';
UPDATE categories SET icon = 'school', icon_library = 'Ionicons' WHERE system_name = 'education_other';

-- =============================================================================
-- SECTION 12: UPDATE L2 HOUSING SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'rent';
UPDATE categories SET icon = 'construct', icon_library = 'Ionicons' WHERE system_name = 'housing_maintenance';
UPDATE categories SET icon = 'receipt', icon_library = 'Ionicons' WHERE system_name = 'housing_tax';
UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'housing_buy';
UPDATE categories SET icon = 'cash', icon_library = 'Ionicons' WHERE system_name = 'housing_sell';
UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'housing_other';

-- =============================================================================
-- SECTION 13: UPDATE L2 TRAVEL SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'sunny', icon_library = 'Ionicons' WHERE system_name = 'vacation';
UPDATE categories SET icon = 'briefcase', icon_library = 'Ionicons' WHERE system_name = 'business_travel';
UPDATE categories SET icon = 'gift', icon_library = 'Ionicons' WHERE system_name = 'holiday';
UPDATE categories SET icon = 'airplane', icon_library = 'Ionicons' WHERE system_name = 'travel_other';

-- =============================================================================
-- SECTION 14: UPDATE L2 INCOME SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'wallet', icon_library = 'Ionicons' WHERE system_name = 'salary';
UPDATE categories SET icon = 'cash', icon_library = 'Ionicons' WHERE system_name = 'bonus';
UPDATE categories SET icon = 'trending-up', icon_library = 'Ionicons' WHERE system_name = 'commission';
UPDATE categories SET icon = 'return-down-back', icon_library = 'Ionicons' WHERE system_name = 'refund';
UPDATE categories SET icon = 'swap-horizontal', icon_library = 'Ionicons' WHERE system_name = 'loan_income';
UPDATE categories SET icon = 'gift', icon_library = 'Ionicons' WHERE system_name = 'gift_income';
UPDATE categories SET icon = 'document-text', icon_library = 'Ionicons' WHERE system_name = 'check';
UPDATE categories SET icon = 'home', icon_library = 'Ionicons' WHERE system_name = 'rental_income';
UPDATE categories SET icon = 'briefcase', icon_library = 'Ionicons' WHERE system_name = 'freelance';
UPDATE categories SET icon = 'business', icon_library = 'Ionicons' WHERE system_name = 'business_income';
UPDATE categories SET icon = 'wallet', icon_library = 'Ionicons' WHERE system_name = 'income_other';

-- =============================================================================
-- SECTION 15: UPDATE L2 DEBT / LOANS SUBCATEGORIES
-- =============================================================================

UPDATE categories SET icon = 'arrow-forward', icon_library = 'Ionicons' WHERE system_name = 'lent_money';
UPDATE categories SET icon = 'arrow-back', icon_library = 'Ionicons' WHERE system_name = 'borrowed_money';
UPDATE categories SET icon = 'checkmark-circle', icon_library = 'Ionicons' WHERE system_name = 'debt_repayment_paid';
UPDATE categories SET icon = 'checkmark-done', icon_library = 'Ionicons' WHERE system_name = 'debt_repayment_received';
UPDATE categories SET icon = 'swap-horizontal', icon_library = 'Ionicons' WHERE system_name = 'debt_other';

-- =============================================================================
-- SECTION 16: UPDATE OTHER SUBCATEGORY
-- =============================================================================

UPDATE categories SET icon = 'help-circle', icon_library = 'Ionicons' WHERE system_name = 'uncategorized';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
