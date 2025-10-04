-- Migration: Align users schema for profile upsert and social links
-- Date: 2025-10-03

-- 1) Add missing social link columns if they don't exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS leetcode_url TEXT;

-- 2) Rename is_profile_complete -> profile_completed if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_profile_complete'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN is_profile_complete TO profile_completed;
  END IF;
END $$;

-- 3) Ensure unique constraint on auth_id (required for upsert on_conflict)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass AND conname = 'users_auth_id_unique'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_auth_id_unique UNIQUE (auth_id);
  END IF;
END $$;

-- 4) Optional URL format checks (can be skipped if too strict)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass AND conname = 'check_linkedin_url'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT check_linkedin_url 
    CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://(www\.)?linkedin\.com/.*$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass AND conname = 'check_github_url'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT check_github_url 
    CHECK (github_url IS NULL OR github_url ~ '^https?://(www\.)?github\.com/[A-Za-z0-9_-]+/?$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass AND conname = 'check_leetcode_url'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT check_leetcode_url 
    CHECK (leetcode_url IS NULL OR leetcode_url ~ '^https?://(www\.)?leetcode\.com/[A-Za-z0-9_-]+/?$');
  END IF;
END $$;

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_passing_year ON public.users(passing_year);
CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users(branch);
CREATE INDEX IF NOT EXISTS idx_users_linkedin_url ON public.users(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_github_url ON public.users(github_url) WHERE github_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_leetcode_url ON public.users(leetcode_url) WHERE leetcode_url IS NOT NULL;

-- 6) RLS policies to allow users to manage their own row (adjust names if they exist)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_select_own'
  ) THEN
    CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = auth_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_insert_own'
  ) THEN
    CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_update_own'
  ) THEN
    CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
  END IF;
END $$;
