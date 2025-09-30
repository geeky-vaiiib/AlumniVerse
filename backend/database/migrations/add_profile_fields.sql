-- Migration: Add Enhanced Profile Fields
-- Run this in Supabase SQL Editor to add new profile fields to existing users table

-- Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS leetcode_url TEXT;

-- Add constraints for URL validation
ALTER TABLE users 
ADD CONSTRAINT check_linkedin_url 
CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://(www\.)?linkedin\.com/.*$');

ALTER TABLE users 
ADD CONSTRAINT check_github_url 
CHECK (github_url IS NULL OR github_url ~ '^https?://(www\.)?github\.com/[A-Za-z0-9_-]+/?$');

ALTER TABLE users 
ADD CONSTRAINT check_leetcode_url 
CHECK (leetcode_url IS NULL OR leetcode_url ~ '^https?://(www\.)?leetcode\.com/[A-Za-z0-9_-]+/?$');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_linkedin_url ON users(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_github_url ON users(github_url) WHERE github_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_leetcode_url ON users(leetcode_url) WHERE leetcode_url IS NOT NULL;

-- Update existing users to have proper profile completion status
UPDATE users 
SET is_profile_complete = (
    first_name IS NOT NULL AND 
    last_name IS NOT NULL AND 
    branch IS NOT NULL AND 
    passing_year IS NOT NULL AND
    is_email_verified = true
)
WHERE is_profile_complete = false;

-- Add comment for documentation
COMMENT ON COLUMN users.resume_url IS 'Direct URL to user resume file (PDF/DOCX)';
COMMENT ON COLUMN users.linkedin_url IS 'LinkedIn profile URL - validated format';
COMMENT ON COLUMN users.github_url IS 'GitHub profile URL - validated format';
COMMENT ON COLUMN users.leetcode_url IS 'LeetCode profile URL - validated format';
