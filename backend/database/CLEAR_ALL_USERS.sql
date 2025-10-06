-- ================================================
-- CLEAR ALL USERS - FRESH START
-- ================================================
-- This script will remove all users from both auth.users and public.users
-- Run this in Supabase SQL Editor to start fresh

-- ================================================
-- STEP 1: DELETE FROM PUBLIC.USERS TABLE
-- ================================================
-- Delete all profiles from public.users table
DELETE FROM public.users;

-- Reset the auto-increment ID sequence (if exists)
-- ALTER SEQUENCE IF EXISTS public.users_id_seq RESTART WITH 1;

-- ================================================
-- STEP 2: DELETE FROM AUTH.USERS TABLE  
-- ================================================
-- Delete all authentication users from auth.users
-- This will also cascade delete related auth sessions
DELETE FROM auth.users;

-- ================================================
-- STEP 3: CLEAN UP AUTH SESSIONS AND REFRESH TOKENS
-- ================================================
-- Clean up any remaining sessions
DELETE FROM auth.sessions;

-- Clean up refresh tokens
DELETE FROM auth.refresh_tokens;

-- ================================================
-- STEP 4: VERIFICATION
-- ================================================
-- Check that all users are deleted
SELECT 'public.users count:' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'auth.users count:' as table_name, COUNT(*) as count FROM auth.users
UNION ALL  
SELECT 'auth.sessions count:' as table_name, COUNT(*) as count FROM auth.sessions
UNION ALL
SELECT 'auth.refresh_tokens count:' as table_name, COUNT(*) as count FROM auth.refresh_tokens;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
-- If all counts are 0, the cleanup was successful
-- You can now register new users from scratch!
