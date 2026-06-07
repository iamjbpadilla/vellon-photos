-- ============================================================
-- Vellon.photos — Complete Production Database Schema
-- Run this in Supabase SQL Editor (New Query → Run)
-- ============================================================

-- -----------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------
-- Note: Using Supabase Free Tier - pgcron not available
-- Lifecycle automation handled via Vercel Cron instead
CREATE EXTENSION IF NOT EXISTS pgjwt;

-- -----------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------

-- profiles: extends auth.users with app-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT,
  email         TEXT NOT NULL,
  avatar_url    TEXT,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- vouchers: discount codes for event creation (must be before events for FK)
CREATE TABLE IF NOT EXISTS public.vouchers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed','percentage')),
  discount_value INTEGER NOT NULL DEFAULT 0,
  max_uses      INTEGER NOT NULL DEFAULT 1,
  used_count    INTEGER NOT NULL DEFAULT 0,
  valid_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until   TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- events: every event has a unique immutable 6-char code
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code      TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL DEFAULT 'Untitled Event',
  description     TEXT,
  cover_image_url TEXT,
  host_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','pending','active','archived')),
  voucher_id      UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ,
  photo_count     INTEGER NOT NULL DEFAULT 0,
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- photos: linked to events, stored in Supabase Storage
CREATE TABLE IF NOT EXISTS public.photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  storage_url     TEXT NOT NULL,
  uploader_name   TEXT,
  uploader_email  TEXT,
  caption         TEXT,
  file_size       INTEGER,
  mime_type       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payment_proofs: manual payment verification queue (fixed ₱699)
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ref_number      TEXT NOT NULL,
  amount          INTEGER NOT NULL DEFAULT 699,
  screenshot_url  TEXT,
  screenshot_path TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at     TIMESTAMPTZ
);

-- event_views: deduped view tracking for analytics
CREATE TABLE IF NOT EXISTS public.event_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ip_hash     TEXT NOT NULL,
  view_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, ip_hash, view_date)
);

-- -----------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_views   ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- events
CREATE POLICY "Hosts full CRUD own events" ON public.events
  FOR ALL USING (host_id = auth.uid());
CREATE POLICY "Public read events by code" ON public.events
  FOR SELECT USING (true); -- event_code is the public access token
CREATE POLICY "Admin full access events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- photos
CREATE POLICY "Public read photos" ON public.photos
  FOR SELECT USING (true);
CREATE POLICY "Authenticated insert photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Host delete own photos" ON public.photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = photos.event_id AND host_id = auth.uid())
  );

-- payment_proofs
CREATE POLICY "Host read own payment proofs" ON public.payment_proofs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = payment_proofs.event_id AND host_id = auth.uid())
  );
CREATE POLICY "Host insert own payment proofs" ON public.payment_proofs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.events WHERE id = payment_proofs.event_id AND host_id = auth.uid())
  );
CREATE POLICY "Admin full access payment proofs" ON public.payment_proofs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- vouchers
CREATE POLICY "Public validate vouchers" ON public.vouchers
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admin full access vouchers" ON public.vouchers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- event_views (system table, only service role / cron inserts)
CREATE POLICY "Service role insert views" ON public.event_views
  FOR INSERT WITH CHECK (false); -- only via service role key
CREATE POLICY "Public read views" ON public.event_views
  FOR SELECT USING (true);

-- -----------------------------------------------------------
-- 4. FUNCTIONS
-- -----------------------------------------------------------

-- Generate unique 6-char alphanumeric event_code
CREATE OR REPLACE FUNCTION public.generate_event_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.events WHERE event_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile + trial event on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_event_id UUID;
  demo_photo_urls TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80'
  ];
  url TEXT;
  i INTEGER := 1;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, email, role, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    'user', -- Default to 'user', admin assigned manually via SQL
    false
  );

  -- Create trial event
  INSERT INTO public.events (event_code, title, host_id, status, expires_at)
  VALUES (
    public.generate_event_code(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Your') || '''s Event',
    NEW.id,
    'trial',
    NOW() + INTERVAL '48 hours'
  )
  RETURNING id INTO new_event_id;

  -- Seed 3 demo photos (external URLs, no storage needed for demo)
  FOREACH url IN ARRAY demo_photo_urls LOOP
    INSERT INTO public.photos (event_id, storage_path, storage_url, uploader_name, caption)
    VALUES (
      new_event_id,
      'demo/' || i || '.jpg',
      url,
      'Vellon',
      CASE i
        WHEN 1 THEN 'Every moment deserves to be remembered.'
        WHEN 2 THEN 'Share your perspective with the ones you love.'
        ELSE 'Your gallery, elegantly curated.'
      END
    );
    i := i + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update event photo_count
CREATE OR REPLACE FUNCTION public.update_event_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events SET photo_count = photo_count + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events SET photo_count = photo_count - 1 WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Track event view (deduped by IP hash per day)
CREATE OR REPLACE FUNCTION public.track_event_view(p_event_id UUID, p_ip_hash TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.event_views (event_id, ip_hash, view_date)
  VALUES (p_event_id, p_ip_hash, CURRENT_DATE)
  ON CONFLICT (event_id, ip_hash, view_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync view counts from event_views to events
CREATE OR REPLACE FUNCTION public.sync_event_view_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE public.events e
  SET view_count = (
    SELECT COUNT(DISTINCT ip_hash)
    FROM public.event_views v
    WHERE v.event_id = e.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate voucher and return discounted amount
CREATE OR REPLACE FUNCTION public.validate_voucher(p_code TEXT, p_base_amount INTEGER DEFAULT 699)
RETURNS TABLE (
  valid BOOLEAN,
  voucher_id UUID,
  final_amount INTEGER,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
  v_discount INTEGER;
BEGIN
  SELECT * INTO v_record FROM public.vouchers
  WHERE UPPER(code) = UPPER(p_code);

  IF v_record IS NULL THEN
    valid := false;
    voucher_id := NULL;
    final_amount := p_base_amount;
    message := 'Invalid voucher code.';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_record.status != 'active' THEN
    valid := false;
    voucher_id := v_record.id;
    final_amount := p_base_amount;
    message := 'This voucher is no longer active.';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_record.valid_from > NOW() THEN
    valid := false;
    voucher_id := v_record.id;
    final_amount := p_base_amount;
    message := 'This voucher is not yet valid.';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_record.valid_until IS NOT NULL AND v_record.valid_until < NOW() THEN
    valid := false;
    voucher_id := v_record.id;
    final_amount := p_base_amount;
    message := 'This voucher has expired.';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_record.used_count >= v_record.max_uses THEN
    valid := false;
    voucher_id := v_record.id;
    final_amount := p_base_amount;
    message := 'This voucher has reached its maximum usage limit.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate discount
  IF v_record.discount_type = 'percentage' THEN
    v_discount := (p_base_amount * v_record.discount_value) / 100;
  ELSE
    v_discount := v_record.discount_value;
  END IF;

  valid := true;
  voucher_id := v_record.id;
  final_amount := GREATEST(p_base_amount - v_discount, 0);
  message := 'Voucher applied successfully.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment voucher used_count
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_voucher_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.vouchers
  SET used_count = used_count + 1
  WHERE id = p_voucher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lifecycle: send warnings and purge expired events
CREATE OR REPLACE FUNCTION public.run_lifecycle()
RETURNS TABLE (
  action TEXT,
  event_id UUID,
  event_title TEXT
) AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Warnings: 3 days out
  FOR rec IN
    SELECT id, title, host_id, expires_at
    FROM public.events
    WHERE status = 'active'
      AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      AND expires_at > NOW() + INTERVAL '2 days'
  LOOP
    action := 'warning_3d';
    event_id := rec.id;
    event_title := rec.title;
    RETURN NEXT;
  END LOOP;

  -- Warnings: 1 day out
  FOR rec IN
    SELECT id, title, host_id, expires_at
    FROM public.events
    WHERE status = 'active'
      AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '1 days'
      AND expires_at > NOW()
  LOOP
    action := 'warning_1d';
    event_id := rec.id;
    event_title := rec.title;
    RETURN NEXT;
  END LOOP;

  -- Purge expired
  FOR rec IN
    SELECT id, title
    FROM public.events
    WHERE status IN ('trial','active')
      AND expires_at < NOW()
  LOOP
    -- Photos deleted externally (Storage + DB rows via API)
    UPDATE public.events
    SET status = 'archived',
        updated_at = NOW()
    WHERE id = rec.id;

    action := 'purged';
    event_id := rec.id;
    event_title := rec.title;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------
-- 5. TRIGGERS
-- -----------------------------------------------------------

-- Auto-create profile + trial event on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update photo_count
DROP TRIGGER IF EXISTS photos_insert_count ON public.photos;
CREATE TRIGGER photos_insert_count
  AFTER INSERT ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_photo_count();

DROP TRIGGER IF EXISTS photos_delete_count ON public.photos;
CREATE TRIGGER photos_delete_count
  AFTER DELETE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_photo_count();

-- Block event_code mutation
CREATE OR REPLACE FUNCTION public.block_event_code_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_code IS DISTINCT FROM OLD.event_code THEN
    RAISE EXCEPTION 'event_code is immutable and cannot be changed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_event_code_change ON public.events;
CREATE TRIGGER prevent_event_code_change
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.block_event_code_update();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------
-- 6. STORAGE BUCKET
-- -----------------------------------------------------------

-- Create bucket for event photos (run in Storage or via SQL if allowed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', false);
-- Note: Create bucket via Supabase Dashboard > Storage > New Bucket
-- Recommended: private bucket, generate signed URLs for gallery access

-- -----------------------------------------------------------
-- 7. REALTIME (Optional)
-- -----------------------------------------------------------
-- Enable realtime for photos table so gallery updates live
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

-- -----------------------------------------------------------
-- POST-SETUP INSTRUCTIONS
-- -----------------------------------------------------------
-- 1. Create storage bucket manually via Supabase Dashboard:
--    Storage > New Bucket > Name: "event-photos" > Public: false
--
-- 2. Assign admin role to your email after signup:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'jubetpadilla@gmail.com';
--
-- 3. Enable Realtime for live gallery updates (optional):
--    ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
--
