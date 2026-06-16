-- Analytics tracking tables for B2B performance metrics and admin financial insights

-- Gallery page views tracking
CREATE TABLE IF NOT EXISTS gallery_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_gallery_views_gallery ON gallery_page_views(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_views_date ON gallery_page_views(viewed_at);

-- Photo interaction tracking (clicks, hearts, lightbox views)
CREATE TABLE IF NOT EXISTS photo_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'lightbox', 'heart'
  interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_interactions_gallery ON photo_interactions(gallery_id);
CREATE INDEX IF NOT EXISTS idx_photo_interactions_photo ON photo_interactions(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_interactions_type ON photo_interactions(interaction_type);

-- Download audit logs for master files
CREATE TABLE IF NOT EXISTS download_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  downloaded_by TEXT NOT NULL, -- email or identifier
  download_code TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size_bytes INTEGER
);

CREATE INDEX IF NOT EXISTS idx_download_audit_gallery ON download_audit_logs(gallery_id);
CREATE INDEX IF NOT EXISTS idx_download_audit_date ON download_audit_logs(downloaded_at);

-- RLS Policies
ALTER TABLE gallery_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_audit_logs ENABLE ROW LEVEL SECURITY;

-- Gallery page views: Service role can insert, users can read their own galleries
CREATE POLICY "Service role can insert page views"
  ON gallery_page_views FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can read page views for their galleries"
  ON gallery_page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_page_views.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all page views"
  ON gallery_page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Photo interactions: Service role can insert, users can read their own galleries
CREATE POLICY "Service role can insert photo interactions"
  ON photo_interactions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can read interactions for their galleries"
  ON photo_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = photo_interactions.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all interactions"
  ON photo_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Download audit logs: Service role can insert, users can read their own galleries
CREATE POLICY "Service role can insert download logs"
  ON download_audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can read download logs for their galleries"
  ON download_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = download_audit_logs.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all download logs"
  ON download_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
