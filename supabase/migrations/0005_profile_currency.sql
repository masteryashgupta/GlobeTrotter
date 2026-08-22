-- 0005_profile_currency.sql
-- Add currency preference to user profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
