-- ================================================
-- CLEAR ONLY SIT EMAIL USERS - SAFER OPTION
-- ================================================
-- This script will remove only users with @sit.ac.in emails
-- This is safer if you have other users you want to keep

-- ================================================
-- STEP 1: DELETE SIT USERS FROM PUBLIC.USERS
-- ================================================
-- Delete profiles for SIT users only
DELETE FROM public.users 
WHERE email LIKE '%@sit.ac.in';

-- ================================================
-- STEP 2: DELETE SIT USERS FROM AUTH.USERS
-- ================================================
-- Delete authentication users with SIT emails
-- This will also cascade delete related sessions and tokens
DELETE FROM auth.users 
WHERE email LIKE '%@sit.ac.in';

-- ================================================
-- STEP 3: VERIFICATION
-- ================================================
-- Check remaining users
SELECT 'Total users remaining:' as info, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'SIT users remaining:' as info, COUNT(*) as count FROM public.users WHERE email LIKE '%@sit.ac.in'
UNION ALL
SELECT 'Auth users remaining:' as info, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Auth SIT users remaining:' as info, COUNT(*) as count FROM auth.users WHERE email LIKE '%@sit.ac.in';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
-- All SIT email users have been cleared!
-- You can now register with fresh SIT emails
