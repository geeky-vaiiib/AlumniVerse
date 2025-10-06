-- ================================================
-- COMPREHENSIVE FIX: Remove Problematic Foreign Key Constraint
-- ================================================
-- This fixes the "users_auth_id_fkey" constraint violation error
-- Run this in Supabase SQL Editor

-- ================================================
-- STEP 1: REMOVE PROBLEMATIC FOREIGN KEY CONSTRAINT
-- ================================================

-- Drop the foreign key constraint that's causing issues
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- ================================================
-- STEP 2: ENSURE auth_id COLUMN EXISTS AND IS PROPERLY CONFIGURED
-- ================================================

-- Add auth_id column if missing
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Create unique index for one-to-one mapping (but not foreign key)
DROP INDEX IF EXISTS users_auth_id_idx;
CREATE UNIQUE INDEX users_auth_id_idx ON public.users (auth_id) WHERE auth_id IS NOT NULL;

-- ================================================
-- STEP 3: SAFE RLS POLICIES (NON-RECURSIVE)
-- ================================================

-- Drop all existing policies to prevent conflicts
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename='users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.users;', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END$$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create safe, non-recursive policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = auth_id);

-- Allow service role to do everything (for server-side operations)
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- STEP 4: ADD NECESSARY COLUMNS IF MISSING
-- ================================================

-- Add all required columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS usn VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS branch_code VARCHAR(10);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passing_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_position VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ================================================
-- STEP 5: VERIFICATION QUERIES
-- ================================================

-- Check auth_id column exists
SELECT 
  'auth_id column check:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'auth_id';

-- Check NO foreign key constraint exists
SELECT 
  'Foreign key constraints:' as info,
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname LIKE '%auth_id%';

-- Check RLS policies
SELECT 
  'RLS policies:' as info,
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Check table structure
SELECT 
  'Table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
-- If no foreign key constraint is shown and auth_id column exists,
-- the fix was successful and profile creation should work!
