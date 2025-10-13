-- ============================================================================
-- REFRESH SUPABASE SCHEMA CACHE & FIX FOREIGN KEY RELATIONSHIPS
-- Run this in Supabase SQL Editor to fix "relationship not found" errors
-- ============================================================================

-- Step 1: Drop and recreate the foreign key constraints to refresh cache
ALTER TABLE IF EXISTS public.posts 
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey CASCADE;

ALTER TABLE IF EXISTS public.posts
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Step 2: Do the same for jobs table
ALTER TABLE IF EXISTS public.jobs 
  DROP CONSTRAINT IF EXISTS jobs_posted_by_fkey CASCADE;

ALTER TABLE IF EXISTS public.jobs
  ADD CONSTRAINT jobs_posted_by_fkey 
  FOREIGN KEY (posted_by) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Step 3: Do the same for events table  
ALTER TABLE IF EXISTS public.events 
  DROP CONSTRAINT IF EXISTS events_organized_by_fkey CASCADE;

ALTER TABLE IF EXISTS public.events
  ADD CONSTRAINT events_organized_by_fkey 
  FOREIGN KEY (organized_by) 
  REFERENCES public.users(id) 
  ON DELETE SET NULL;

-- Step 4: Add helpful columns if missing
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Step 5: Create functions to auto-update counters
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

-- Step 6: Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_post_likes_count_on_delete ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count_on_delete
AFTER DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count_on_delete();

-- Step 7: Refresh existing counts
UPDATE public.posts
SET likes_count = (
  SELECT COUNT(*) FROM public.post_likes WHERE post_id = posts.id
);

-- Step 8: Force schema cache refresh by touching PostgREST
NOTIFY pgrst, 'reload schema';

-- Step 9: Verify the foreign keys exist
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('posts', 'jobs', 'events')
  AND tc.table_schema = 'public';

-- Output should show:
-- posts | posts_author_id_fkey | FOREIGN KEY | author_id | users | id
-- jobs | jobs_posted_by_fkey | FOREIGN KEY | posted_by | users | id
-- events | events_organized_by_fkey | FOREIGN KEY | organized_by | users | id
