-- ================================================
-- CRITICAL FIX: Infinite Recursion Policy Error
-- ================================================
-- This fixes the "Infinite recursion detected in policy for relation 'users'" error
-- Run this in Supabase SQL Editor immediately

-- ================================================
-- STEP 1: INSPECT CURRENT POLICIES (for diagnostics)
-- ================================================
-- Copy the output of this query to understand what's causing recursion
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- ================================================
-- STEP 2: EMERGENCY - DISABLE RLS TEMPORARILY
-- ================================================
-- This immediately stops the infinite recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Test your app now - the profile save should work
-- DO NOT LEAVE RLS DISABLED - we'll re-enable with safe policies below

-- ================================================
-- STEP 3: SCHEMA RECONCILIATION
-- ================================================

-- Add auth_id column if missing
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Create unique index for one-to-one mapping
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_idx ON public.users (auth_id);

-- Add foreign key to auth.users for referential integrity
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

-- ================================================
-- STEP 4: REMOVE ALL RECURSIVE POLICIES
-- ================================================
-- Drop ALL existing policies that might cause recursion
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename='users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.users;', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END$$;

-- ================================================
-- STEP 5: CREATE SAFE, NON-RECURSIVE POLICIES
-- ================================================
-- These policies use ONLY auth.uid() and auth.role() - NO subqueries to users table

-- Allow authenticated users to SELECT their own profile
CREATE POLICY "Allow select own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Allow authenticated users to INSERT only their own profile
CREATE POLICY "Allow insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Allow authenticated users to UPDATE only their own profile
CREATE POLICY "Allow update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Allow authenticated users to DELETE their own profile
CREATE POLICY "Allow delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = auth_id);

-- Allow service role to do everything (for server-side operations)
CREATE POLICY "Allow service role all operations" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- STEP 6: RE-ENABLE RLS WITH SAFE POLICIES
-- ================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 7: VERIFICATION QUERIES
-- ================================================

-- Check that policies are created correctly
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- Test that auth_id column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'auth_id';

-- Show constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname LIKE '%auth_id%';

-- ================================================
-- SUCCESS MESSAGES
-- ================================================
SELECT '🎯 CRITICAL FIX COMPLETE!' as message;
SELECT '✅ Infinite recursion policy error should be resolved' as status;
SELECT '✅ Safe RLS policies created using only auth.uid()' as status;
SELECT '✅ No more subqueries to users table in policies' as status;
SELECT '🚀 Profile save should now work without errors!' as message;

-- ================================================
-- NEXT STEPS
-- ================================================
SELECT '📋 NEXT: Test profile save in your app' as next_step;
SELECT '📋 NEXT: If it works, proceed with frontend patches' as next_step;
SELECT '📋 NEXT: Add server endpoint for robust profile creation' as next_step;
