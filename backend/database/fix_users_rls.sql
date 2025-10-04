-- Fix Users RLS: Remove recursive policies and create safe, non-recursive policies
-- Run this in Supabase SQL Editor

-- 1) Drop previously created policies (both our earlier names and any prior ones)
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

DROP POLICY IF EXISTS "Allow individual read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.users;
DROP POLICY IF EXISTS "Allow individual update access" ON public.users;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.users;

-- 2) Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3) Create safe, standard non-recursive policies
-- POLICY: Allow users to view their own profile
CREATE POLICY "Allow individual read access" ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- POLICY: Allow users to create their own profile entry
CREATE POLICY "Allow individual insert access" ON public.users
FOR INSERT
WITH CHECK (auth.uid() = auth_id);

-- POLICY: Allow users to update their own profile
CREATE POLICY "Allow individual update access" ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- POLICY: Allow users to delete their own profile (optional)
CREATE POLICY "Allow individual delete access" ON public.users
FOR DELETE
USING (auth.uid() = auth_id);

-- NOTE:
-- Do NOT reference public.users inside a policy on public.users (e.g., SELECT ... FROM public.users ...)
-- as it will cause infinite recursion. If you need admin-wide read access, prefer JWT claim checks, e.g.:
--
-- Example (commented out):
-- CREATE POLICY "Allow admin read access" ON public.users
-- FOR SELECT USING (
--   coalesce((auth.jwt() ->> 'app_role'), '') = 'admin' OR auth.uid() = auth_id
-- );
--
-- Then set a custom JWT claim 'app_role' for admin accounts in your auth system.
