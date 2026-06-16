-- Lifecycle Management Functions

-- Function to revoke download codes after 15 days (Heritage Period)
CREATE OR REPLACE FUNCTION revoke_expired_archives()
RETURNS void AS $$
BEGIN
  UPDATE galleries
  SET expired_archive = true
  WHERE created_at < NOW() - INTERVAL '15 days'
    AND expired_archive = false;
END;
$$ LANGUAGE plpgsql;

-- Function to purge master files after 6 months (or 30 days for expired archives)
CREATE OR REPLACE FUNCTION purge_master_files()
RETURNS void AS $$
DECLARE
  expired_gallery RECORD;
  photo_record RECORD;
BEGIN
  -- First, handle 15-day expired archives (30-day purge)
  FOR expired_gallery IN 
    SELECT id 
    FROM galleries 
    WHERE expired_archive = true 
      AND created_at < NOW() - INTERVAL '30 days'
  LOOP
    -- Delete master files from storage
    FOR photo_record IN 
      SELECT master_url 
      FROM photos 
      WHERE gallery_id = expired_gallery.id
    LOOP
      -- Extract file path from signed URL (this would need custom logic based on your URL structure)
      -- For now, we'll mark photos as having no master
      UPDATE photos
      SET master_url = ''
      WHERE gallery_id = expired_gallery.id
        AND master_url = photo_record.master_url;
    END LOOP;
  END LOOP;

  -- Then, handle 6-month general purge
  FOR expired_gallery IN 
    SELECT id 
    FROM galleries 
    WHERE created_at < NOW() - INTERVAL '6 months'
  LOOP
    -- Delete master files from storage
    FOR photo_record IN 
      SELECT master_url 
      FROM photos 
      WHERE gallery_id = expired_gallery.id
      AND master_url != ''
    LOOP
      -- Extract file path from signed URL
      -- Mark photos as having no master
      UPDATE photos
      SET master_url = ''
      WHERE gallery_id = expired_gallery.id
        AND master_url = photo_record.master_url;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check and enforce fair use caps
CREATE OR REPLACE FUNCTION enforce_fair_use_caps()
RETURNS void AS $$
DECLARE
  gallery_record RECORD;
  photo_count INTEGER;
  storage_gb NUMERIC;
BEGIN
  FOR gallery_record IN 
    SELECT id, fair_use_cap_photos, fair_use_cap_storage_gb
    FROM galleries
  LOOP
    -- Count photos
    SELECT COUNT(*) INTO photo_count
    FROM photos
    WHERE gallery_id = gallery_record.id;
    
    -- Calculate storage (estimated from master URLs - this would need actual storage API integration)
    -- For now, we'll use a placeholder
    storage_gb := 0;
    
    -- If caps exceeded, mark for review
    IF photo_count > gallery_record.fair_use_cap_photos THEN
      -- Log cap violation (could create a violations table)
      RAISE NOTICE 'Gallery % exceeded photo cap: % > %', 
        gallery_record.id, photo_count, gallery_record.fair_use_cap_photos;
    END IF;
    
    IF storage_gb > gallery_record.fair_use_cap_storage_gb THEN
      RAISE NOTICE 'Gallery % exceeded storage cap: % > %', 
        gallery_record.id, storage_gb, gallery_record.fair_use_cap_storage_gb;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job (pg_cron extension must be enabled in Supabase)
-- This runs daily at 12:00 AM UTC
-- SELECT cron.schedule('daily-lifecycle-purge', '0 0 * * *', 'SELECT revoke_expired_archives(); SELECT purge_master_files();');

-- Create a scheduled job for fair use cap monitoring (runs weekly)
-- SELECT cron.schedule('weekly-fair-use-check', '0 0 * * 0', 'SELECT enforce_fair_use_caps();');

-- Manual trigger for testing
-- SELECT revoke_expired_archives();
-- SELECT purge_master_files();
-- SELECT enforce_fair_use_caps();
