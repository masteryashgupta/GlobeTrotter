-- 0003_add_admin_flag.sql
-- Adds is_admin boolean column to profiles table for admin role gating.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- RLS: Only allow admins to see other profiles' is_admin status (public read already exists, this is additive)
-- No RLS changes needed — existing policies cover reads; admins are verified server-side via service role key.

-- NOTE: To grant admin access to your test account, run the following manually in the Supabase SQL editor,
-- replacing <your-user-id> with the actual UUID from auth.users:
--
--   UPDATE public.profiles SET is_admin = true WHERE id = '<your-user-id>';
