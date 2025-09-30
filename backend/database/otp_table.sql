-- Create OTP codes table for email verification
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  is_used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_otp ON otp_codes(otp);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- RLS Policies for OTP codes
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own OTP codes (for admin/service operations)
CREATE POLICY "Users can view own OTP codes" ON otp_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can manage all OTP codes
CREATE POLICY "Service role can manage OTP codes" ON otp_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired OTP codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < NOW() OR is_used = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON otp_codes TO service_role;
GRANT SELECT ON otp_codes TO authenticated;

COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email verification during signup';
COMMENT ON COLUMN otp_codes.otp IS '6-digit OTP code';
COMMENT ON COLUMN otp_codes.expires_at IS 'OTP expiration time (10 minutes from creation)';
COMMENT ON COLUMN otp_codes.is_used IS 'Whether the OTP has been used for verification';
