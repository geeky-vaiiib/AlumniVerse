-- AlumniVerse Database Schema
-- PostgreSQL Database Schema for Alumni Engagement Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB operations
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users table - Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    
    -- Profile information
    bio TEXT,
    branch VARCHAR(100),
    graduation_year INTEGER,
    current_position VARCHAR(200),
    company VARCHAR(200),
    location VARCHAR(200),
    phone VARCHAR(20),
    
    -- JSONB fields for flexible data
    skills JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    career_preferences JSONB DEFAULT '{}',
    
    -- File paths
    profile_picture VARCHAR(500),
    resume VARCHAR(500),
    
    -- Metadata
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Jobs table - Job and internship postings
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    type VARCHAR(20) DEFAULT 'job' CHECK (type IN ('job', 'internship')),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    salary_range VARCHAR(100),
    
    -- JSONB for flexible fields
    required_skills JSONB DEFAULT '[]',
    benefits JSONB DEFAULT '[]',
    
    -- Application details
    application_url VARCHAR(500),
    contact_email VARCHAR(255),
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Relationships
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table - Alumni events and reunions
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'networking' CHECK (type IN ('reunion', 'networking', 'workshop', 'seminar', 'social', 'career')),
    
    -- Event details
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(300) NOT NULL,
    max_attendees INTEGER,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Virtual event support
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_link VARCHAR(500),
    
    -- JSONB fields
    agenda JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- Relationships
    organized_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees - Many-to-many relationship
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled')),
    
    UNIQUE(event_id, user_id)
);

-- Badges table - User recognition and achievements
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    category VARCHAR(30) DEFAULT 'general' CHECK (category IN ('engagement', 'profile', 'contribution', 'achievement', 'milestone', 'general')),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    
    -- JSONB for additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Relationships
    awarded_by UUID REFERENCES users(id),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Prevent duplicate badges for same user and type
    UNIQUE(user_id, badge_type)
);

-- OTP verification table - For email verification and password reset
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table - For JWT refresh token management
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_graduation_year ON users(graduation_year);
CREATE INDEX idx_users_branch ON users(branch);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_users_skills ON users USING GIN(skills);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);

CREATE INDEX idx_events_organized_by ON events(organized_by);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_tags ON events USING GIN(tags);
CREATE INDEX idx_events_created_at ON events(created_at);

CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);

CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_badge_type ON badges(badge_type);
CREATE INDEX idx_badges_awarded_at ON badges(awarded_at);

CREATE INDEX idx_otp_email ON otp_verifications(email);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample badge types
INSERT INTO badges (id, user_id, badge_type, category, title, description, points, awarded_by) VALUES
(uuid_generate_v4(), uuid_generate_v4(), 'early_adopter', 'engagement', 'Early Adopter', 'One of the first users to join the platform', 50, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'profile_complete', 'profile', 'Profile Master', 'Completed all profile sections', 25, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'job_poster', 'contribution', 'Job Creator', 'Posted first job opportunity', 30, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'event_organizer', 'contribution', 'Event Organizer', 'Organized first alumni event', 40, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'networking_star', 'engagement', 'Networking Star', 'Connected with 50+ alumni', 75, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'mentor', 'contribution', 'Mentor', 'Actively mentoring junior alumni', 100, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'top_contributor', 'achievement', 'Top Contributor', 'Among top 10 contributors this month', 150, NULL),
(uuid_generate_v4(), uuid_generate_v4(), 'anniversary', 'milestone', 'Anniversary', 'Celebrating graduation anniversary', 20, NULL)
ON CONFLICT (user_id, badge_type) DO NOTHING;
