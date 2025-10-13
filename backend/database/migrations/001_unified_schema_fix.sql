-- ============================================================================
-- COMPREHENSIVE SCHEMA FIX FOR ALUMNIVERSE
-- ============================================================================
-- This migration fixes all database schema issues including:
-- 1. Proper foreign key relationships
-- 2. Unique constraint conflicts (email + auth_id)
-- 3. Missing columns and indexes
-- 4. Row Level Security (RLS) policies
-- 5. Real-time publication setup
-- ============================================================================

-- STEP 1: Ensure users table has proper structure
-- ============================================================================

-- Add auth_id column if missing (links to Supabase auth.users)
ALTER TABLE IF EXISTS public.users 
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Make auth_id unique if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_auth_id_key' 
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users 
      ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
  END IF;
END $$;

-- Drop the email unique constraint to allow updates
-- We'll rely on auth_id as the primary unique identifier
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_email_key;

-- Create a partial unique index on email for non-deleted users only
DROP INDEX IF EXISTS users_email_active_idx;
CREATE UNIQUE INDEX users_email_active_idx 
  ON public.users (email) 
  WHERE is_deleted = FALSE;

-- Add profile_completed column if missing
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add missing standard columns
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS passing_year INTEGER,
  ADD COLUMN IF NOT EXISTS admission_year INTEGER,
  ADD COLUMN IF NOT EXISTS branch_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS usn VARCHAR(20),
  ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS leetcode_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500);

-- STEP 2: Ensure posts table exists with proper structure
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'general',
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop and recreate foreign key for posts.author_id -> users.id
ALTER TABLE public.posts 
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey CASCADE;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- STEP 3: Ensure jobs table has proper foreign keys
-- ============================================================================

-- Drop and recreate foreign key for jobs.posted_by -> users.id
ALTER TABLE IF EXISTS public.jobs 
  DROP CONSTRAINT IF EXISTS jobs_posted_by_fkey CASCADE;

ALTER TABLE IF EXISTS public.jobs
  ADD CONSTRAINT jobs_posted_by_fkey 
  FOREIGN KEY (posted_by) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Add missing columns to jobs table
ALTER TABLE IF EXISTS public.jobs 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 4: Ensure events table has proper foreign keys
-- ============================================================================

-- Drop and recreate foreign key for events.organized_by -> users.id
ALTER TABLE IF EXISTS public.events 
  DROP CONSTRAINT IF EXISTS events_organized_by_fkey CASCADE;

ALTER TABLE IF EXISTS public.events
  ADD CONSTRAINT events_organized_by_fkey 
  FOREIGN KEY (organized_by) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Add missing columns to events table
ALTER TABLE IF EXISTS public.events 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 5: Create post_likes table if missing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- STEP 6: Create post_comments table if missing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Create indexes for performance
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_passing_year ON public.users(passing_year);
CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users(branch);

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON public.posts(is_deleted);

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_organized_by ON public.events(organized_by);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

-- STEP 8: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- STEP 9: Create RLS Policies
-- ============================================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Posts policies
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Jobs policies
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
CREATE POLICY "Authenticated users can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
CREATE POLICY "Users can update own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = posted_by);

-- Events policies  
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own events" ON public.events;
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = organized_by);

-- Post likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
CREATE POLICY "Users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- STEP 10: Create updated_at triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Create functions for counters
-- ============================================================================

CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = (
    SELECT COUNT(*) FROM public.post_likes WHERE post_id = NEW.post_id
  )
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_likes_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = (
    SELECT COUNT(*) FROM public.post_likes WHERE post_id = OLD.post_id
  )
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = (
    SELECT COUNT(*) FROM public.post_comments 
    WHERE post_id = NEW.post_id AND is_deleted = FALSE
  )
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = (
    SELECT COUNT(*) FROM public.post_comments 
    WHERE post_id = OLD.post_id AND is_deleted = FALSE
  )
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- STEP 12: Create triggers for counters
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_post_likes_count_on_delete ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count_on_delete
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count_on_delete();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count_on_delete ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count_on_delete
  AFTER UPDATE OF is_deleted ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count_on_delete();

-- STEP 13: Enable realtime for all tables
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- STEP 14: Refresh schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- STEP 15: Verification queries
-- ============================================================================

-- Verify foreign keys
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('posts', 'jobs', 'events', 'post_likes', 'post_comments')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Expected output:
-- - Foreign keys properly established
-- - RLS policies active
-- - Realtime enabled
-- - Unique constraints fixed
-- - All indexes created
-- ============================================================================
