-- AlumniVerse Supabase Database Schema
-- This file creates all necessary tables, indexes, and RLS policies for production

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Links to Supabase auth.users.id
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    usn VARCHAR(20) UNIQUE, -- University Serial Number
    branch VARCHAR(100),
    admission_year INTEGER,
    passing_year INTEGER,
    bio TEXT,
    current_position VARCHAR(200),
    company VARCHAR(200),
    location VARCHAR(200),
    phone VARCHAR(20),
    skills JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    career_preferences JSONB DEFAULT '{}'::jsonb,
    resume_path TEXT,
    avatar_path TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    last_login TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    type VARCHAR(20) DEFAULT 'job' CHECK (type IN ('job', 'internship')),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    salary_range VARCHAR(100),
    required_skills JSONB DEFAULT '[]'::jsonb,
    application_url TEXT,
    contact_email VARCHAR(255),
    deadline TIMESTAMP WITH TIME ZONE,
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('reunion', 'networking', 'workshop', 'seminar', 'social', 'career', 'other')),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    max_attendees INTEGER,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    is_virtual BOOLEAN DEFAULT false,
    meeting_link TEXT,
    agenda JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    organized_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees table (many-to-many relationship)
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('achievement', 'participation', 'contribution', 'milestone', 'special')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    awarded_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type) -- Prevent duplicate badge types per user
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_usn ON users(usn);
CREATE INDEX idx_users_branch ON users(branch);
CREATE INDEX idx_users_passing_year ON users(passing_year);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

CREATE INDEX idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);

CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_organized_by ON events(organized_by);
CREATE INDEX idx_events_is_active ON events(is_active);

CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);

CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_badge_type ON badges(badge_type);
CREATE INDEX idx_badges_points ON badges(points);
CREATE INDEX idx_badges_awarded_at ON badges(awarded_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
