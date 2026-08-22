-- 0004_storage_buckets.sql
-- Create and configure avatars and trip-covers storage buckets with strict RLS

-- Insert buckets safely
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, '{"image/png", "image/jpeg", "image/webp", "image/gif"}'),
  ('trip-covers', 'trip-covers', true, 5242880, '{"image/png", "image/jpeg", "image/webp", "image/gif"}')
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Clean up any existing policies from 0003_storage_trip_covers.sql
DROP POLICY IF EXISTS "Public Read trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete trip-covers" ON storage.objects;

-- Remove any old avatar policies just in case
DROP POLICY IF EXISTS "Public Read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Remove trip-covers policies from previous 0004 run if they exist
DROP POLICY IF EXISTS "Public Read trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own trip-covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own trip-covers" ON storage.objects;

-- 1. Avatars Policies

-- Public Read
CREATE POLICY "Public Read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated Insert
CREATE POLICY "Authenticated users upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Owner Update
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND name LIKE 'avatars/' || auth.uid()::text || '-%'
  );

-- Owner Delete
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND name LIKE 'avatars/' || auth.uid()::text || '-%'
  );


-- 2. Trip Covers Policies

-- Public Read
CREATE POLICY "Public Read trip-covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-covers');

-- Authenticated Insert
CREATE POLICY "Authenticated users upload trip-covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trip-covers' AND auth.role() = 'authenticated');

-- Owner Update
CREATE POLICY "Users can update their own trip-covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'trip-covers' 
    AND name LIKE 'covers/' || auth.uid()::text || '/%'
  );

-- Owner Delete
CREATE POLICY "Users can delete their own trip-covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'trip-covers' 
    AND name LIKE 'covers/' || auth.uid()::text || '/%'
  );
