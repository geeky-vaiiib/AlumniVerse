# Environment Setup Guide

This guide explains how to set up environment variables for the AlumniVerse project.

## Overview

AlumniVerse consists of two main components:
- **Frontend**: Next.js application (port 3000)
- **Backend**: Express.js API server (port 5001)

Each component requires its own environment configuration.

## Frontend Environment Setup (.env.local)

Copy `.env.example` to `.env.local` in the root directory:

```bash
cp .env.example .env.local
```

### Required Variables

#### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Backend API Configuration
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
BACKEND_URL=http://localhost:5001
```

#### App Configuration
```env
NEXT_PUBLIC_APP_NAME=AlumniVerse
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Email Domain Restriction
```env
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=sit.ac.in
```

#### File Upload Limits (in bytes)
```env
NEXT_PUBLIC_MAX_AVATAR_SIZE=5242880
NEXT_PUBLIC_MAX_RESUME_SIZE=10485760
NEXT_PUBLIC_ALLOWED_AVATAR_TYPES=image/jpeg,image/png,image/webp
NEXT_PUBLIC_ALLOWED_RESUME_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

## Backend Environment Setup (backend/.env)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

### Required Variables

#### Supabase Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Server Configuration
```env
PORT=5001
NODE_ENV=development
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d
```

#### CORS Configuration
```env
FRONTEND_URL=http://localhost:3000
```

#### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### File Upload Configuration
```env
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

#### Security
```env
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production
```

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT keys
3. **Change default secrets** in production
4. **Keep service role key secure** - it bypasses RLS
5. **Use environment-specific values** for different deployments

## Environment Variable Types

### Frontend Variables
- `NEXT_PUBLIC_*` variables are **exposed to the browser**
- Use only for non-sensitive configuration
- Available in client-side code

### Backend Variables
- **Server-side only** - never exposed to browser
- Use for sensitive data like API keys and secrets
- Available only in Node.js environment

## Verification

After setting up environment variables:

1. **Frontend**: Check browser console for Supabase initialization messages
2. **Backend**: Check server logs for successful startup messages
3. **Integration**: Test authentication flow end-to-end

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` exists with correct Supabase credentials

2. **"No API key found"**
   - Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly

3. **Backend connection errors**
   - Verify `BACKEND_URL` matches your backend server address

4. **CORS errors**
   - Ensure `FRONTEND_URL` in backend matches your frontend URL

### Debug Commands

```bash
# Check if environment files exist
ls -la .env*
ls -la backend/.env*

# Verify environment variables are loaded (backend)
cd backend && node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL)"

# Test backend server
curl http://localhost:5001/api/health
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use environment-specific Supabase projects
6. Configure proper rate limiting
7. Set up monitoring and logging

## Support

If you encounter issues:
1. Check this guide first
2. Verify all environment variables are set
3. Check server logs for error messages
4. Ensure Supabase project is properly configured
