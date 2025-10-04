-- ================================================
-- Quick Reference SQL for AlumniVerse Troubleshooting
-- ================================================

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Check if auth_id column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'auth_id';

-- 2. Check all constraints on users table
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 3. View all RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- ============================================
-- USER DATA QUERIES
-- ============================================

-- 5. View recent user profiles
SELECT 
  id,
  auth_id,
  email,
  first_name,
  last_name,
  is_email_verified,
  profile_completed,
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC
LIMIT 20;

-- 6. Find users without auth_id (needs fixing)
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at
FROM public.users
WHERE auth_id IS NULL;

-- 7. Find auth users without database profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.users u ON u.auth_id = au.id
WHERE u.id IS NULL;

-- 8. Check for duplicate auth_id values (should be none)
SELECT 
  auth_id,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM public.users
WHERE auth_id IS NOT NULL
GROUP BY auth_id
HAVING COUNT(*) > 1;

-- 9. Verify auth_id matches between tables
SELECT 
  u.id as db_profile_id,
  u.email as db_email,
  au.email as auth_email,
  u.auth_id = au.id as ids_match,
  u.created_at as profile_created,
  au.created_at as auth_created
FROM public.users u
JOIN auth.users au ON u.auth_id = au.id
ORDER BY u.created_at DESC
LIMIT 20;

-- ============================================
-- CLEANUP & FIX QUERIES
-- ============================================

-- 10. Delete duplicate profiles (keep newest)
-- ⚠️ USE WITH CAUTION - Test in staging first
DELETE FROM public.users a 
USING public.users b
WHERE a.id < b.id 
  AND a.auth_id = b.auth_id 
  AND a.auth_id IS NOT NULL;

-- 11. Create missing profiles for auth users
-- This auto-creates profiles for users who have auth but no DB record
INSERT INTO public.users (
  auth_id, 
  email, 
  is_email_verified, 
  profile_completed,
  password_hash,
  created_at
)
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL,
  false,
  null,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.auth_id = au.id
)
ON CONFLICT (auth_id) DO NOTHING;

-- 12. Update is_email_verified based on auth status
UPDATE public.users u
SET is_email_verified = (au.email_confirmed_at IS NOT NULL)
FROM auth.users au
WHERE u.auth_id = au.id;

-- 13. Find profiles with invalid URLs (will fail constraint)
SELECT 
  id,
  email,
  linkedin_url,
  github_url,
  leetcode_url
FROM public.users
WHERE 
  (linkedin_url IS NOT NULL AND linkedin_url !~* '^https?://')
  OR (github_url IS NOT NULL AND github_url !~* '^https?://')
  OR (leetcode_url IS NOT NULL AND leetcode_url !~* '^https?://');

-- 14. Clean up invalid URLs (set to NULL)
UPDATE public.users
SET 
  linkedin_url = CASE 
    WHEN linkedin_url IS NOT NULL AND linkedin_url !~* '^https?://' 
    THEN NULL 
    ELSE linkedin_url 
  END,
  github_url = CASE 
    WHEN github_url IS NOT NULL AND github_url !~* '^https?://' 
    THEN NULL 
    ELSE github_url 
  END,
  leetcode_url = CASE 
    WHEN leetcode_url IS NOT NULL AND leetcode_url !~* '^https?://' 
    THEN NULL 
    ELSE leetcode_url 
  END;

-- ============================================
-- STATISTICS & MONITORING
-- ============================================

-- 15. User statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_email_verified THEN 1 END) as verified_users,
  COUNT(CASE WHEN profile_completed THEN 1 END) as completed_profiles,
  COUNT(CASE WHEN auth_id IS NOT NULL THEN 1 END) as users_with_auth_id,
  COUNT(CASE WHEN auth_id IS NULL THEN 1 END) as users_without_auth_id
FROM public.users;

-- 16. Recent signups (last 24 hours)
SELECT 
  email,
  first_name,
  last_name,
  is_email_verified,
  profile_completed,
  created_at
FROM public.users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 17. Branch distribution
SELECT 
  branch,
  COUNT(*) as count
FROM public.users
WHERE branch IS NOT NULL
GROUP BY branch
ORDER BY count DESC;

-- 18. Graduation year distribution
SELECT 
  passing_year,
  COUNT(*) as count
FROM public.users
WHERE passing_year IS NOT NULL
GROUP BY passing_year
ORDER BY passing_year DESC;

-- ============================================
-- TESTING QUERIES (as authenticated user)
-- ============================================

-- 19. Test SELECT policy (should return current user's profile)
-- Run this while logged in to Supabase Dashboard
SELECT * FROM public.users WHERE auth_id = auth.uid();

-- 20. Test SELECT all (should return verified profiles)
SELECT 
  email, 
  first_name, 
  last_name, 
  branch, 
  passing_year
FROM public.users 
WHERE is_email_verified = true AND is_deleted = false
LIMIT 10;

-- ============================================
-- EMERGENCY RESET (⚠️ DANGEROUS)
-- ============================================

-- 21. Nuclear option - delete all user profiles
-- ⚠️⚠️⚠️ THIS WILL DELETE ALL USER DATA ⚠️⚠️⚠️
-- Only use if you need to start completely fresh
/*
DELETE FROM public.users;
SELECT 'All user profiles deleted. Ready for fresh start.' as status;
*/

-- 22. Reset specific user profile
-- Useful for testing signup flow for the same email
/*
DELETE FROM public.users WHERE email = 'test@sitpune.edu.in';
DELETE FROM auth.users WHERE email = 'test@sitpune.edu.in';
SELECT 'Test user deleted from both tables.' as status;
*/

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- 23. Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY idx_scan DESC;

-- 24. Table size and row count
SELECT 
  pg_size_pretty(pg_total_relation_size('public.users')) as total_size,
  pg_size_pretty(pg_relation_size('public.users')) as table_size,
  pg_size_pretty(pg_total_relation_size('public.users') - pg_relation_size('public.users')) as indexes_size,
  (SELECT COUNT(*) FROM public.users) as row_count;

-- ============================================
-- EXPORT QUERIES
-- ============================================

-- 25. Export user data (CSV-ready format)
SELECT 
  email,
  first_name,
  last_name,
  usn,
  branch,
  passing_year,
  company,
  current_position,
  location,
  is_email_verified,
  profile_completed,
  created_at
FROM public.users
WHERE is_deleted = false
ORDER BY created_at DESC;

-- ============================================
-- NOTES
-- ============================================

/*
TIPS FOR USING THESE QUERIES:

1. Always run verification queries (#1-9) first to understand current state
2. Test cleanup queries (#10-14) on a staging database before production
3. Monitor statistics (#15-18) regularly to track growth
4. Use testing queries (#19-20) to verify RLS policies work
5. Emergency resets (#21-22) should be last resort only

COMMON WORKFLOWS:

After applying migration:
  1. Run query #1 (check auth_id exists)
  2. Run query #2 (check constraints)
  3. Run query #3 (check RLS policies)
  4. Run query #4 (check RLS enabled)
  5. Run query #8 (check for duplicates)

After user signup:
  1. Run query #5 (view recent profiles)
  2. Run query #9 (verify auth_id matches)
  3. Run query #15 (check statistics)

Troubleshooting:
  1. Run query #7 (find orphaned auth users)
  2. Run query #6 (find profiles without auth_id)
  3. Run query #8 (check duplicates)
  4. Run query #11 (auto-fix orphaned users)
*/
