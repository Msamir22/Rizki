-- Migration: Add color column to categories table
-- This adds the color field for UI display

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#9CA3AF';

-- Update existing system categories with colors
UPDATE categories SET color = '#F59E0B' WHERE system_name = 'food';
UPDATE categories SET color = '#3B82F6' WHERE system_name = 'transport';
UPDATE categories SET color = '#EC4899' WHERE system_name = 'shopping';
UPDATE categories SET color = '#8B5CF6' WHERE system_name = 'utilities';
UPDATE categories SET color = '#14B8A6' WHERE system_name = 'entertainment';
UPDATE categories SET color = '#EF4444' WHERE system_name = 'health';
UPDATE categories SET color = '#F97316' WHERE system_name = 'education';
UPDATE categories SET color = '#6366F1' WHERE system_name = 'housing';
UPDATE categories SET color = '#F472B6' WHERE system_name = 'personal_care';
UPDATE categories SET color = '#0EA5E9' WHERE system_name = 'subscriptions';
UPDATE categories SET color = '#A855F7' WHERE system_name = 'gifts';
UPDATE categories SET color = '#06B6D4' WHERE system_name = 'travel';
UPDATE categories SET color = '#9CA3AF' WHERE system_name = 'other_expense';

-- Income categories
UPDATE categories SET color = '#10B981' WHERE system_name = 'salary';
UPDATE categories SET color = '#22C55E' WHERE system_name = 'freelance';
UPDATE categories SET color = '#059669' WHERE system_name = 'investments';
UPDATE categories SET color = '#0D9488' WHERE system_name = 'rental_income';
UPDATE categories SET color = '#14B8A6' WHERE system_name = 'business_income';
UPDATE categories SET color = '#34D399' WHERE system_name = 'other_income';
