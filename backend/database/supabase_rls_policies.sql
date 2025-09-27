-- Row Level Security Policies for AlumniVerse
-- These policies ensure secure access to data based on user authentication

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

-- Storage policies (for file uploads)
-- These will be created in Supabase dashboard or via SQL

-- Avatars bucket policy
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Resumes bucket policy (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "Users can view their own resume" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload their own resume" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own resume" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own resume" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admins can access all files
CREATE POLICY "Admins can manage all files" ON storage.objects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin' 
            AND is_deleted = false
        )
    );
