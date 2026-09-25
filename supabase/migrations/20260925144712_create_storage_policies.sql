/*
# Storage policies for eye-photos bucket

## Overview
Creates RLS policies on storage.objects so authenticated users can only
read/write files under their own folder path: user_id/filename.

## Security
- SELECT: users can read objects in their own folder
- INSERT: users can upload to their own folder
- UPDATE: users can update objects in their own folder
- DELETE: users can delete objects in their own folder
*/

DROP POLICY IF EXISTS "read_own_eye_photos" ON storage.objects;
CREATE POLICY "read_own_eye_photos" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'eye-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "insert_own_eye_photos" ON storage.objects;
CREATE POLICY "insert_own_eye_photos" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'eye-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "update_own_eye_photos" ON storage.objects;
CREATE POLICY "update_own_eye_photos" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'eye-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'eye-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_own_eye_photos" ON storage.objects;
CREATE POLICY "delete_own_eye_photos" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'eye-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
