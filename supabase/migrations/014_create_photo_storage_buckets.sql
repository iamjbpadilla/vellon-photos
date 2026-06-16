-- Create storage buckets for photo uploads

-- Previews bucket (public, for gallery display)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('previews', 'previews', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

-- Masters bucket (private, for high-quality originals)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('masters', 'masters', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for previews bucket (public read, service write)
CREATE POLICY "Public read access for previews"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'previews');

CREATE POLICY "Service role can upload to previews"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'previews');

CREATE POLICY "Service role can delete from previews"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'previews');

-- RLS policies for masters bucket (service only)
CREATE POLICY "Service role can upload to masters"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'masters');

CREATE POLICY "Service role can delete from masters"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'masters');

CREATE POLICY "Service role can read from masters"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'masters');
