-- Trial Gallery Onboarding Trigger
-- Automatically creates a trial gallery with sample photos when a new profile is created

-- Function to create trial gallery with sample photos
CREATE OR REPLACE FUNCTION create_trial_gallery()
RETURNS TRIGGER AS $$
DECLARE
  gallery_id UUID;
  secure_code TEXT;
BEGIN
  -- Generate a unique secure code
  secure_code := encode(gen_random_bytes(16), 'hex');
  
  -- Create the trial gallery
  INSERT INTO galleries (
    user_id,
    slug,
    title,
    description,
    theme_preset,
    canvas_tone,
    secure_code,
    is_active,
    expired_archive,
    fair_use_cap_photos,
    fair_use_cap_storage_gb
  )
  VALUES (
    NEW.id,
    'trial-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 8),
    'Trial Event',
    'Your first Vellon gallery - explore the premium editorial experience',
    'heritage',
    'linen',
    secure_code,
    true, -- Active for trial users
    false,
    2000,
    40
  )
  RETURNING id INTO gallery_id;
  
  -- Insert sample placeholder photos
  -- Using placeholder image service for demo purposes
  INSERT INTO photos (gallery_id, preview_url, master_url, blurhash, position, chapter)
  VALUES
    (gallery_id, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=90', 'L7A3{6%M00xu00~q00Rj00M|00~q00M|00', 1, 'Introduction'),
    (gallery_id, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=90', 'L6A4{5%L00xu00~q00Rj00M|00~q00M|00', 2, 'Journey'),
    (gallery_id, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=90', 'L5B3{4%K00xu00~q00Rj00M|00~q00M|00', 3, 'Moments'),
    (gallery_id, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=90', 'L8C6{7%N00xu00~q00Rj00M|00~q00M|00', 4, 'Reflections'),
    (gallery_id, 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=2000&q=90', 'L9D8{8%O00xu00~q00Rj00M|00~q00M|00', 5, 'Finale');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_create ON profiles;
CREATE TRIGGER on_profile_create
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_gallery();
