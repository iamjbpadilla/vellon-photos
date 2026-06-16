-- User Agreements Table for consent tracking
CREATE TABLE user_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('storage_caps', 'lifecycle_purge', 'terms_of_service')),
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Queue Table for automated reminders
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('day_4', 'day_8', 'day_12', 'day_15')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Favorites Table for filtered downloads
CREATE TABLE client_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, gallery_id, photo_id)
);

-- Update Galleries Table with new fields
ALTER TABLE galleries
  ADD COLUMN event_pin TEXT UNIQUE,
  ADD COLUMN is_private BOOLEAN DEFAULT FALSE,
  ADD COLUMN notification_schedule JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN agreement_consent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX idx_user_agreements_gallery_id ON user_agreements(gallery_id);
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_gallery_id ON notification_queue(gallery_id);
CREATE INDEX idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_client_favorites_user_id ON client_favorites(user_id);
CREATE INDEX idx_client_favorites_gallery_id ON client_favorites(gallery_id);
CREATE INDEX idx_client_favorites_photo_id ON client_favorites(photo_id);

-- Row-Level Security Policies

ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_favorites ENABLE ROW LEVEL SECURITY;

-- User Agreements RLS
CREATE POLICY "Users can view own agreements" ON user_agreements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create agreements" ON user_agreements
  FOR INSERT WITH CHECK (true);

-- Notification Queue RLS
CREATE POLICY "No direct access to notification queue" ON notification_queue
  FOR ALL USING (false);

-- Client Favorites RLS
CREATE POLICY "Users can view own favorites" ON client_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON client_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON client_favorites
  FOR DELETE USING (auth.uid() = user_id);
