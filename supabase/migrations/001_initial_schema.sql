-- Enable UUID extension (Supabase uses pgcrypto by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (B2C individuals vs B2B photographers)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('b2c', 'b2b')),
  is_verified BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  custom_domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Galleries table
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme_preset TEXT NOT NULL DEFAULT 'heritage' CHECK (theme_preset IN ('heritage', 'contemporary')),
  canvas_tone TEXT NOT NULL DEFAULT 'linen' CHECK (canvas_tone IN ('linen', 'sepia', 'obsidian')),
  audio_track_url TEXT,
  secure_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  expired_archive BOOLEAN DEFAULT FALSE,
  custom_domain TEXT UNIQUE,
  fair_use_cap_photos INTEGER DEFAULT 2000,
  fair_use_cap_storage_gb INTEGER DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  preview_url TEXT NOT NULL,
  master_url TEXT NOT NULL,
  blurhash TEXT NOT NULL,
  position INTEGER NOT NULL,
  chapter TEXT,
  guest_tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manual payment queue table
CREATE TABLE manual_payment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  reference_number TEXT UNIQUE NOT NULL,
  receipt_url TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment ledger table with anti-replay protection
CREATE TABLE payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  reference_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('b2c_event', 'b2b_subscription')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voucher pool table
CREATE TABLE voucher_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER NOT NULL,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Download attempts table for brute force protection
CREATE TABLE download_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, photo_id)
);

-- Download links table
CREATE TABLE download_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  secure_code TEXT NOT NULL,
  zip_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest uploads table
CREATE TABLE guest_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_payment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Galleries RLS
CREATE POLICY "Public can view active galleries" ON galleries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can view own galleries" ON galleries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can create galleries" ON galleries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own galleries" ON galleries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own galleries" ON galleries
  FOR DELETE USING (auth.uid() = user_id);

-- Photos RLS
CREATE POLICY "Public can view photos from active galleries" ON photos
  FOR SELECT USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE is_active = true
    )
  );

CREATE POLICY "Owners can view own photos" ON photos
  FOR SELECT USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create photos" ON photos
  FOR INSERT WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own photos" ON photos
  FOR UPDATE USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own photos" ON photos
  FOR DELETE USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

-- Manual payment queue RLS
CREATE POLICY "Users can view own payment queue" ON manual_payment_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment queue entries" ON manual_payment_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment ledger RLS
CREATE POLICY "Users can view own payment ledger" ON payment_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Voucher pool RLS (admin only via service role)
CREATE POLICY "No direct access to voucher pool" ON voucher_pool
  FOR ALL USING (false);

-- Download attempts RLS
CREATE POLICY "Users can view own download attempts" ON download_attempts
  FOR SELECT USING (true);

CREATE POLICY "System can create download attempts" ON download_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update download attempts" ON download_attempts
  FOR UPDATE USING (true);

-- Favorites RLS
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Download links RLS
CREATE POLICY "Users can view own download links" ON download_links
  FOR SELECT USING (true);

CREATE POLICY "System can create download links" ON download_links
  FOR INSERT WITH CHECK (true);

-- Guest uploads RLS
CREATE POLICY "Public can view approved guest uploads" ON guest_uploads
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can view all guest uploads" ON guest_uploads
  FOR SELECT USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can create guest uploads" ON guest_uploads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can update guest uploads" ON guest_uploads
  FOR UPDATE USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

-- Atomic voucher function to prevent race conditions
CREATE OR REPLACE FUNCTION apply_voucher_securely(
  p_code TEXT,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_discount DECIMAL(10, 2);
  v_max_uses INTEGER;
  v_current_uses INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Lock the row for update
  SELECT 
    discount_amount, 
    max_uses, 
    current_uses, 
    expires_at
  INTO 
    v_discount, 
    v_max_uses, 
    v_current_uses, 
    v_expires_at
  FROM voucher_pool
  WHERE code = p_code
  FOR UPDATE;

  -- Check if voucher exists and is valid
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if expired
  IF v_expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  -- Check if max uses reached
  IF v_current_uses >= v_max_uses THEN
    RETURN FALSE;
  END IF;

  -- Increment usage
  UPDATE voucher_pool
  SET current_uses = current_uses + 1
  WHERE code = p_code;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Rollback function for failed transactions
CREATE OR REPLACE FUNCTION decrement_voucher_uses_fallback(
  p_code TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE voucher_pool
  SET current_uses = GREATEST(0, current_uses - 1)
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_galleries_user_id ON galleries(user_id);
CREATE INDEX idx_galleries_slug ON galleries(slug);
CREATE INDEX idx_galleries_is_active ON galleries(is_active);
CREATE INDEX idx_photos_gallery_id ON photos(gallery_id);
CREATE INDEX idx_photos_position ON photos(position);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_gallery_id ON favorites(gallery_id);
CREATE INDEX idx_download_attempts_ip ON download_attempts(ip_address);
CREATE INDEX idx_download_attempts_gallery ON download_attempts(gallery_id);
CREATE INDEX idx_guest_uploads_gallery ON guest_uploads(gallery_id);
CREATE INDEX idx_guest_uploads_status ON guest_uploads(status);
