-- ============================================================================
-- ALUMNIVERSE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor to create all required tables
-- Go to: https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================================

-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'general',
  images TEXT[],
  tags TEXT[],
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  type VARCHAR(50),
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  experience_level VARCHAR(50),
  required_skills TEXT[],
  posted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  attendees_count INTEGER DEFAULT 0,
  category VARCHAR(50),
  organized_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organized_by) WHERE organized_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date DESC);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Posts (public read, authenticated write)
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- RLS Policies for Post Likes
CREATE POLICY "Post likes are viewable by everyone" ON public.post_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- RLS Policies for Comments
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- RLS Policies for Jobs
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own jobs" ON public.jobs
  FOR UPDATE USING (posted_by IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own jobs" ON public.jobs
  FOR DELETE USING (posted_by IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- RLS Policies for Events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (organized_by IS NULL OR organized_by IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (organized_by IS NULL OR organized_by IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- RLS Policies for Event Registrations
CREATE POLICY "Event registrations are viewable by everyone" ON public.event_registrations
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can unregister from events" ON public.event_registrations
  FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
