-- Atomic voucher redemption function to prevent race conditions
-- This ensures that multiple users cannot claim the same single-use voucher simultaneously

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS apply_voucher_securely;

CREATE FUNCTION apply_voucher_securely(voucher_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  voucher_record RECORD;
BEGIN
  -- Lock row for update to prevent race conditions
  SELECT * INTO voucher_record
  FROM voucher_pool
  WHERE code = voucher_code
  FOR UPDATE;
  
  -- Check if voucher exists and has uses remaining
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF voucher_record.current_uses >= voucher_record.max_uses THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage atomically
  UPDATE voucher_pool
  SET current_uses = current_uses + 1
  WHERE code = voucher_code;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
