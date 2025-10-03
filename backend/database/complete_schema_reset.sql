-- ⚠️ WARNING: This script will permanently delete all data in your existing public tables
-- Complete Database Schema Reset for AlumniVerse
-- Execute this in Supabase SQL Editor

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;

-- Step 2: Create the users table with robust schema
CREATE TABLE public.users (
    -- Core Fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Basic Profile Information
    first_name TEXT,
    last_name TEXT,
    usn TEXT UNIQUE,
    branch TEXT,
    admission_year INT,
    passing_year INT,

    -- Detailed Profile Information
    bio TEXT,
    location TEXT,
    company TEXT,
    current_position TEXT, -- Using current_position to match existing code
    skills TEXT[], -- Using array for skills
    achievements TEXT,
    interests TEXT,

    -- File URLs
    resume_url TEXT,
    avatar_path TEXT,

    -- Social & Professional URLs with proper validation
    -- Allow NULL or valid URLs only (no empty strings)
    github_url TEXT CONSTRAINT check_github_url 
        CHECK (github_url IS NULL OR github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/?$'),
    linkedin_url TEXT CONSTRAINT check_linkedin_url 
        CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https://(www\.)?linkedin\.com/(in|pub)/.+$'),
    leetcode_url TEXT CONSTRAINT check_leetcode_url 
        CHECK (leetcode_url IS NULL OR leetcode_url ~ '^https://(www\.)?leetcode\.com/[A-Za-z0-9_.-]+/?$'),

    -- Application-specific flags
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    
    -- Metadata
    last_login TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_usn ON public.users(usn);
CREATE INDEX idx_users_branch ON public.users(branch);
CREATE INDEX idx_users_passing_year ON public.users(passing_year);
CREATE INDEX idx_users_company ON public.users(company);
CREATE INDEX idx_users_profile_completed ON public.users(profile_completed);
CREATE INDEX idx_users_is_deleted ON public.users(is_deleted);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON public.users FOR SELECT
USING (auth.uid() = auth_id);

-- Allow users to create their own profile entry
CREATE POLICY "users_insert_own" ON public.users FOR INSERT
WITH CHECK (auth.uid() = auth_id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Allow admin to view all profiles (optional)
CREATE POLICY "users_select_admin" ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for users table
CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Step 7: Create supporting tables (optional - for future features)

-- Jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT DEFAULT 'job' CHECK (type IN ('job', 'internship')),
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    salary_range TEXT,
    required_skills TEXT[],
    application_url TEXT,
    contact_email TEXT,
    deadline TIMESTAMPTZ,
    posted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('reunion', 'networking', 'workshop', 'seminar', 'social', 'career', 'other')),
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    max_attendees INT,
    registration_deadline TIMESTAMPTZ,
    is_virtual BOOLEAN DEFAULT false,
    meeting_link TEXT,
    agenda JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    organized_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event attendees junction table
CREATE TABLE public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Badges table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('achievement', 'participation', 'contribution', 'milestone', 'special')),
    title TEXT NOT NULL,
    description TEXT,
    points INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    awarded_by UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    awarded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_type)
);

-- Enable RLS on supporting tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for supporting tables (allow authenticated users to read)
CREATE POLICY "jobs_select_all" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT TO authenticated WITH CHECK (posted_by = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE TO authenticated USING (posted_by = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "events_select_all" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT TO authenticated WITH CHECK (organized_by = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (organized_by = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "event_attendees_select_all" ON public.event_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_attendees_insert_own" ON public.event_attendees FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "badges_select_all" ON public.badges FOR SELECT TO authenticated USING (true);

-- Create indexes for supporting tables
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX idx_jobs_type ON public.jobs(type);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_is_active ON public.jobs(is_active);

CREATE INDEX idx_events_organized_by ON public.events(organized_by);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_is_active ON public.events(is_active);

CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);

CREATE INDEX idx_badges_user_id ON public.badges(user_id);
CREATE INDEX idx_badges_category ON public.badges(category);
CREATE INDEX idx_badges_badge_type ON public.badges(badge_type);

-- Add triggers for updated_at on supporting tables
CREATE TRIGGER on_jobs_updated
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_events_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'AlumniVerse database schema reset completed successfully!' as status;
