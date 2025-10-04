-- ================================================
-- FINAL FIX: Clean Duplicate Users & Enforce Uniqueness
-- ================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This will permanently resolve the 406 Not Acceptable error

-- ================================================
-- STEP 1: AUDIT - Check for duplicates
-- ================================================
SELECT 
    auth_id, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as row_ids,
    STRING_AGG(email, ', ') as emails,
    STRING_AGG(COALESCE(updated_at::text, created_at::text, 'no-date'), ', ') as dates
FROM public.users
WHERE auth_id IS NOT NULL
GROUP BY auth_id
HAVING COUNT(*) > 1;

-- ================================================
-- STEP 2: CLEAN - Remove duplicates (keep most recent)
-- ================================================
-- This keeps only the most recently updated row per auth_id
WITH duplicates_to_remove AS (
    SELECT id
    FROM (
        SELECT 
            id,
            auth_id,
            ROW_NUMBER() OVER (
                PARTITION BY auth_id 
                ORDER BY 
                    updated_at DESC NULLS LAST,
                    created_at DESC NULLS LAST,
                    id DESC
            ) as rn
        FROM public.users
        WHERE auth_id IS NOT NULL
    ) ranked
    WHERE rn > 1
)
DELETE FROM public.users
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- ================================================
-- STEP 3: ENFORCE - Add unique constraint
-- ================================================
-- Ensure auth_id can never have duplicates again
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_auth_id_key'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
        RAISE NOTICE 'Unique constraint users_auth_id_key added successfully';
    ELSE
        RAISE NOTICE 'Unique constraint users_auth_id_key already exists';
    END IF;
END $$;

-- ================================================
-- STEP 4: VERIFY - Confirm no duplicates remain
-- ================================================
-- This should return 0 rows if successful
SELECT 
    'DUPLICATES STILL EXIST!' as warning,
    auth_id, 
    COUNT(*) as count
FROM public.users
WHERE auth_id IS NOT NULL
GROUP BY auth_id
HAVING COUNT(*) > 1;

-- If the above returns no rows, show success message
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT auth_id) INTO dup_count
    FROM public.users
    WHERE auth_id IN (
        SELECT auth_id 
        FROM public.users 
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id 
        HAVING COUNT(*) > 1
    );
    
    IF dup_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: No duplicate auth_ids found. Database is clean!';
    ELSE
        RAISE WARNING '⚠️ WARNING: % auth_ids still have duplicates', dup_count;
    END IF;
END $$;

-- ================================================
-- OPTIONAL: Nuclear Option (if above doesn't work)
-- ================================================
-- Uncomment and run ONLY if you still have issues:
-- DELETE FROM public.users;
-- ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
