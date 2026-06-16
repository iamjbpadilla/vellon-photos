-- Add is_admin field to profiles table for flexible multi-admin support
-- This moves admin recognition from environment variable to database

-- Add is_admin boolean field with default false
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add RLS policy to restrict admin field updates to existing admins only
CREATE POLICY "Only admins can update admin status" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Note: Initial admin should be set manually via database or API
-- Example: UPDATE profiles SET is_admin = TRUE WHERE email = 'admin@example.com';
