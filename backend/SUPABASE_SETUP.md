# Supabase Setup Guide for AlumniVerse

This guide will help you set up Supabase for the AlumniVerse platform.

## 1. Get Supabase API Keys

1. Go to your Supabase project dashboard: https://app.supabase.com/project/flcgwqlabywhoulqalaz
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://flcgwqlabywhoulqalaz.supabase.co`
   - **anon public key**: Copy the `anon` key
   - **service_role key**: Copy the `service_role` key (keep this secret!)

## 2. Update Environment Variables

Update your `.env` file with the actual Supabase keys:

```env
# Supabase Configuration
SUPABASE_URL=https://flcgwqlabywhoulqalaz.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 3. Create Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database/supabase_schema.sql`
3. Click **Run** to create all tables and indexes

## 4. Set Up Row Level Security

1. In the **SQL Editor**, copy and paste the contents of `database/supabase_rls_policies.sql`
2. Click **Run** to create all RLS policies

## 5. Configure Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create two buckets:
   - **avatars** (public bucket for profile pictures)
   - **resumes** (private bucket for resume files)

### Avatar Bucket Setup:
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg,image/png,image/webp`

### Resume Bucket Setup:
- Name: `resumes`
- Public: ❌ No
- File size limit: 10MB
- Allowed MIME types: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## 6. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:

### Email Settings:
- Enable email confirmations
- Set custom SMTP (optional) or use Supabase's default

### Site URL:
- Development: `http://localhost:3000`
- Production: Your actual domain

### Email Templates:
Customize the email templates for:
- Confirm signup
- Reset password
- Magic link

### Providers:
- Enable Email provider
- Optionally enable Google, GitHub, etc.

## 7. Set Up Email Domain Restriction

Add this function to restrict signups to @sit.ac.in emails:

```sql
-- Create function to validate SIT email domain
CREATE OR REPLACE FUNCTION validate_sit_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@sit.ac.in' THEN
    RAISE EXCEPTION 'Only SIT email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email validation
CREATE TRIGGER validate_email_domain
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_sit_email();
```

## 8. Test the Setup

Run the sample data creation script:

```bash
node database/setup_supabase.js
```

## 9. Verify Everything Works

1. Check that all tables are created in **Table Editor**
2. Verify RLS policies are active in **Authentication** → **Policies**
3. Test file upload in **Storage**
4. Try creating a test user with @sit.ac.in email

## 10. Frontend Integration

Once Supabase is set up, update your React frontend to use Supabase client:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://flcgwqlabywhoulqalaz.supabase.co'
const supabaseAnonKey = 'your_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Security Checklist

- ✅ RLS policies are enabled on all tables
- ✅ Service role key is kept secret (server-side only)
- ✅ Anon key is used for client-side operations
- ✅ Email domain restriction is active
- ✅ Storage buckets have proper access policies
- ✅ CORS is configured for your domain

## Troubleshooting

### Common Issues:

1. **"Row Level Security is enabled but no policies exist"**
   - Run the RLS policies SQL script
   - Check that policies are created in the dashboard

2. **"Invalid API key"**
   - Verify you're using the correct anon/service role keys
   - Check that keys are properly set in environment variables

3. **"Email domain validation not working"**
   - Ensure the trigger function is created
   - Check that the trigger is active on auth.users table

4. **"File upload fails"**
   - Verify storage buckets are created
   - Check bucket policies and permissions
   - Ensure file size and type restrictions are met

## Next Steps

After Supabase setup is complete:
1. Update backend controllers to use Supabase client
2. Implement Supabase Auth in frontend
3. Test all CRUD operations
4. Deploy to production with proper environment variables
