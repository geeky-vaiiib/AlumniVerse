-- ================================================
-- NUCLEAR OPTION: Complete Users Table Reset
-- ================================================
-- ⚠️ WARNING: This will DELETE ALL user profile data
-- Use this ONLY if the deduplication script doesn't work

-- STEP 1: Delete all user profiles
DELETE FROM public.users;

-- STEP 2: Ensure unique constraint exists
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_auth_id_key;

ALTER TABLE public.users 
ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);

-- STEP 3: Verify table is empty and constraint is active
SELECT 
    'Table row count: ' || COUNT(*)::text as status
FROM public.users;

SELECT 
    'Unique constraint on auth_id: ' || 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'public.users'::regclass 
            AND conname = 'users_auth_id_key'
        ) 
        THEN '✅ ACTIVE' 
        ELSE '❌ MISSING' 
    END as constraint_status;

-- Success message
SELECT '🎯 Nuclear reset complete. Table is empty and auth_id uniqueness is enforced.' as message;
