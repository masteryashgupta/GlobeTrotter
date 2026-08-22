-- 0003_storage_trip_covers.sql
-- Create trip-covers storage bucket for Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-covers', 'trip-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
CREATE POLICY "Public Read trip-covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-covers');

CREATE POLICY "Authenticated users upload trip-covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trip-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update trip-covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'trip-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users delete trip-covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'trip-covers' AND auth.role() = 'authenticated');
