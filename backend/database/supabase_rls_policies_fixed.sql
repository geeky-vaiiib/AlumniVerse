-- Row Level Security Policies for AlumniVerse (Fixed Version)
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view verified profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Users table policies
CREATE POLICY "Users can view verified profiles" ON users
    FOR SELECT USING (is_email_verified = true AND is_deleted = false);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin' 
            AND is_deleted = false
        )
    );

-- Drop existing job policies
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;

-- Jobs table policies
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create jobs" ON jobs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND is_email_verified = true 
            AND is_deleted = false
        )
    );

CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = posted_by
        )
    );

CREATE POLICY "Users can delete own jobs" ON jobs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = posted_by
        )
    );

CREATE POLICY "Admins can manage all jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin' 
            AND is_deleted = false
        )
    );

-- Drop existing event policies
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

-- Events table policies
CREATE POLICY "Anyone can view active events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND is_email_verified = true 
            AND is_deleted = false
        )
    );

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = organized_by
        )
    );

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = organized_by
        )
    );

CREATE POLICY "Admins can manage all events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin' 
            AND is_deleted = false
        )
    );

-- Drop existing event attendee policies
DROP POLICY IF EXISTS "Users can view event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can register for events" ON event_attendees;
DROP POLICY IF EXISTS "Users can update own registration" ON event_attendees;
DROP POLICY IF EXISTS "Users can cancel own registration" ON event_attendees;
DROP POLICY IF EXISTS "Event organizers can manage attendees" ON event_attendees;

-- Event attendees policies
CREATE POLICY "Users can view event attendees" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = user_id 
            AND is_email_verified = true 
            AND is_deleted = false
        )
    );

CREATE POLICY "Users can update own registration" ON event_attendees
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = user_id
        )
    );

CREATE POLICY "Users can cancel own registration" ON event_attendees
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND id = user_id
        )
    );

CREATE POLICY "Event organizers can manage attendees" ON event_attendees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events e
            JOIN users u ON u.id = e.organized_by
            WHERE e.id = event_id 
            AND u.auth_id = auth.uid()
        )
    );

-- Drop existing badge policies
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
DROP POLICY IF EXISTS "Only admins can award badges" ON badges;
DROP POLICY IF EXISTS "Only admins can update badges" ON badges;
DROP POLICY IF EXISTS "Only admins can delete badges" ON badges;

-- Badges table policies
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can award badges" ON badges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_deleted = false
        )
    );

CREATE POLICY "Only admins can update badges" ON badges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_deleted = false
        )
    );

CREATE POLICY "Only admins can delete badges" ON badges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin' 
            AND is_deleted = false
        )
    );
