-- ================================================
-- CRITICAL FIX: Add auth_id column and reconcile schema
-- ================================================
-- This migration adds the missing auth_id column that RLS policies require
-- and fixes schema mismatches between the database and application code

-- STEP 1: Add auth_id column if it doesn't exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- STEP 2: Make password_hash nullable (we use Supabase Auth, not local passwords)
ALTER TABLE public.users
  ALTER COLUMN password_hash DROP NOT NULL;

-- STEP 3: Add unique constraint on auth_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
    AND conname = 'users_auth_id_key'
  ) THEN
    ALTER TABLE public.users 
      ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
  END IF;
END $$;

-- STEP 4: Create index on auth_id for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- STEP 5: Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
    AND conname = 'users_auth_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_auth_id_fkey 
      FOREIGN KEY (auth_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- STEP 6: Add missing columns that application code expects
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS usn VARCHAR(50);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS branch_code VARCHAR(10);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS admission_year INTEGER;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS leetcode_url VARCHAR(500);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- STEP 7: Add constraints for URL validation (must be valid URLs or NULL)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS linkedin_url_format;

ALTER TABLE public.users
  ADD CONSTRAINT linkedin_url_format 
  CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://');

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS github_url_format;

ALTER TABLE public.users
  ADD CONSTRAINT github_url_format 
  CHECK (github_url IS NULL OR github_url ~* '^https?://');

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS leetcode_url_format;

ALTER TABLE public.users
  ADD CONSTRAINT leetcode_url_format 
  CHECK (leetcode_url IS NULL OR leetcode_url ~* '^https?://');

-- STEP 8: Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 9: Drop and recreate RLS policies with proper auth_id checks
DROP POLICY IF EXISTS "Users can view verified profiles" ON public.users;
CREATE POLICY "Users can view verified profiles" ON public.users
  FOR SELECT 
  USING (is_email_verified = true AND is_deleted = false);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin' 
      AND is_deleted = false
    )
  );

-- STEP 10: Verification queries
SELECT 
  'auth_id column: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'auth_id'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 
  'auth_id unique constraint: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
    AND conname = 'users_auth_id_key'
  ) THEN '✅ ACTIVE' ELSE '❌ MISSING' END as status;

SELECT 
  'auth_id foreign key: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
    AND conname = 'users_auth_id_fkey'
  ) THEN '✅ ACTIVE' ELSE '❌ MISSING' END as status;

-- Success message
SELECT '🎯 Schema migration complete! The users table now has auth_id and all required columns.' as message;
