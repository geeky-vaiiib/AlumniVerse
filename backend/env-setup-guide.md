# Environment Setup Guide for AlumniVerse Backend

## Required Environment Variables

Create a `.env` file in the backend directory with these variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
```

## How to Get Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following:
   - Project URL → SUPABASE_URL
   - anon/public key → SUPABASE_ANON_KEY  
   - service_role key → SUPABASE_SERVICE_ROLE_KEY

## Current Issue

The backend is failing to connect to Supabase because these environment variables are not set.
This is causing the profile creation to fail during signup.

## Quick Test

Once you set up the environment variables, test with:

```bash
# Test the signup endpoint
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "1si23is117@sit.ac.in",
    "password": "TestPassword123!"
  }'
```

This should return success with the user profile created automatically.
