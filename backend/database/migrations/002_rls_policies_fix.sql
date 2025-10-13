-- AlumniVerse RLS Policies Fix
-- This migration adds the missing RLS policies that are causing 401 errors

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public read access for users" ON users;

DROP POLICY IF EXISTS "Jobs public read" ON jobs;
DROP POLICY IF EXISTS "Jobs authenticated insert" ON jobs;
DROP POLICY IF EXISTS "Jobs owner update" ON jobs;

DROP POLICY IF EXISTS "Events public read" ON events;
DROP POLICY IF EXISTS "Events authenticated insert" ON events;
DROP POLICY IF EXISTS "Events owner update" ON events;

DROP POLICY IF EXISTS "Event attendees public read" ON event_attendees;
DROP POLICY IF EXISTS "Event attendees authenticated insert" ON event_attendees;
DROP POLICY IF EXISTS "Event attendees owner update" ON event_attendees;

DROP POLICY IF EXISTS "Badges public read" ON badges;
DROP POLICY IF EXISTS "Badges authenticated insert" ON badges;

-- USERS TABLE POLICIES
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON users
FOR SELECT USING (auth.uid() = auth_id);

-- Allow authenticated users to update their own profile  
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = auth_id);

-- Allow public read access for directory/alumni listing
CREATE POLICY "Public read access for users" ON users
FOR SELECT USING (NOT is_deleted);

-- JOBS TABLE POLICIES
-- Public read for all jobs
CREATE POLICY "Jobs public read" ON jobs
FOR SELECT USING (is_active = true);

-- Authenticated users can post jobs
CREATE POLICY "Jobs authenticated insert" ON jobs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND posted_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Job owners can update their own jobs
CREATE POLICY "Jobs owner update" ON jobs
FOR UPDATE USING (posted_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- EVENTS TABLE POLICIES  
-- Public read for all events
CREATE POLICY "Events public read" ON events
FOR SELECT USING (is_active = true);

-- Authenticated users can create events
CREATE POLICY "Events authenticated insert" ON events
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND organized_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Event organizers can update their own events
CREATE POLICY "Events owner update" ON events  
FOR UPDATE USING (organized_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- EVENT ATTENDEES TABLE POLICIES
-- Public read for event attendees
CREATE POLICY "Event attendees public read" ON event_attendees
FOR SELECT USING (true);

-- Authenticated users can register for events
CREATE POLICY "Event attendees authenticated insert" ON event_attendees
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can update their own attendance
CREATE POLICY "Event attendees owner update" ON event_attendees
FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- BADGES TABLE POLICIES
-- Public read for badges
CREATE POLICY "Badges public read" ON badges
FOR SELECT USING (is_active = true);

-- Only system/admin can insert badges (for now)
CREATE POLICY "Badges authenticated insert" ON badges
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON jobs TO authenticated; 
GRANT ALL ON events TO authenticated;
GRANT ALL ON event_attendees TO authenticated;
GRANT ALL ON badges TO authenticated;

-- Grant select permission to anonymous users for public data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON jobs TO anon;
GRANT SELECT ON events TO anon;
GRANT SELECT ON event_attendees TO anon;
GRANT SELECT ON badges TO anon;

-- Create helper function to get current user's internal ID
CREATE OR REPLACE FUNCTION auth.get_user_internal_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1);
END;
$$;

-- Add newsfeed table and policies if missing
CREATE TABLE IF NOT EXISTS newsfeed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for newsfeed
ALTER TABLE newsfeed ENABLE ROW LEVEL SECURITY;

-- Newsfeed policies
CREATE POLICY "Newsfeed public read" ON newsfeed
FOR SELECT USING (is_active = true);

CREATE POLICY "Newsfeed authenticated insert" ON newsfeed  
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Newsfeed author update" ON newsfeed
FOR UPDATE USING (author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Grant permissions for newsfeed
GRANT ALL ON newsfeed TO authenticated;
GRANT SELECT ON newsfeed TO anon;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsfeed_author_id ON newsfeed(author_id);
CREATE INDEX IF NOT EXISTS idx_newsfeed_created_at ON newsfeed(created_at);
CREATE INDEX IF NOT EXISTS idx_newsfeed_is_active ON newsfeed(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_newsfeed_updated_at BEFORE UPDATE ON newsfeed
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();