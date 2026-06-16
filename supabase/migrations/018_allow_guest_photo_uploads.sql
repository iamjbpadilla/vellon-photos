-- Allow guest uploads to active galleries without authentication
CREATE POLICY "Guests can upload to active galleries" ON photos
  FOR INSERT WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries WHERE is_active = true
    )
  );
