# Database Setup Instructions

## 🎯 **Setup Steps for AlumniVerse Database**

### **1. Access Supabase Dashboard**
1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your AlumniVerse project

### **2. Run SQL Schema Files**

Navigate to **SQL Editor** in the Supabase dashboard and run these files in order:

#### **Step 1: Run Main Schema** (if not already done)
```sql
-- File: backend/database/supabase_schema.sql
-- This creates: users, jobs, events, event_attendees, badges tables
```

Copy and paste the contents of `backend/database/supabase_schema.sql` into the SQL editor and click **Run**.

#### **Step 2: Run Social Features Schema**
```sql
-- File: backend/database/social_features_schema.sql
-- This creates: posts, comments, post_likes, comment_likes, connections, job_bookmarks tables
```

Copy and paste the contents of `backend/database/social_features_schema.sql` into the SQL editor and click **Run**.

### **3. Verify Tables Created**

After running the schemas, verify these tables exist in your database:

**Core Tables:**
- ✅ `users` - User profiles
- ✅ `jobs` - Job postings
- ✅ `events` - Events
- ✅ `event_attendees` - Event registrations
- ✅ `badges` - User badges

**Social Features Tables:**
- ✅ `posts` - User posts/news feed
- ✅ `comments` - Post comments
- ✅ `post_likes` - Post likes
- ✅ `comment_likes` - Comment likes
- ✅ `connections` - Alumni connections
- ✅ `job_bookmarks` - Saved jobs

### **4. Verify Row Level Security (RLS)**

All tables should have RLS enabled. Check in Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. Verify policies exist for each table
3. Policies should allow:
   - Users to read public data
   - Users to create/update/delete their own data
   - Proper authorization checks

### **5. Test Database Connection**

Run this test query in SQL Editor:
```sql
-- Test query to verify setup
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM posts) as posts_count,
  (SELECT COUNT(*) FROM jobs) as jobs_count,
  (SELECT COUNT(*) FROM events) as events_count;
```

Expected result: All counts should return (likely 0 for new database).

### **6. Environment Variables**

Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from Supabase Dashboard → **Settings** → **API**

---

## 🔧 **Troubleshooting**

### **Error: "relation already exists"**
- Tables already created. You can skip that schema file.
- Or drop tables first (see schema files for DROP statements).

### **Error: "permission denied"**
- Check RLS policies are correctly set up
- Verify you're using the correct Supabase keys

### **Error: "function does not exist"**
- Make sure you ran the social_features_schema.sql completely
- Check that triggers and functions were created

### **Posts/Jobs/Events not showing**
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check RLS policies allow SELECT for authenticated users
4. Ensure user is logged in (check auth state)

---

## 📊 **Database Schema Overview**

### **Posts Table**
```
posts
├── id (UUID, PK)
├── author_id (UUID, FK → users.id)
├── content (TEXT)
├── post_type (VARCHAR)
├── images (JSONB)
├── links (JSONB)
├── tags (JSONB)
├── likes_count (INTEGER)
├── comments_count (INTEGER)
└── created_at (TIMESTAMP)
```

### **Jobs Table**
```
jobs
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── company (VARCHAR)
├── location (VARCHAR)
├── type (VARCHAR)
├── posted_by (UUID, FK → users.id)
└── created_at (TIMESTAMP)
```

### **Events Table**
```
events
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── category (VARCHAR)
├── event_date (TIMESTAMP)
├── location (VARCHAR)
├── organized_by (UUID, FK → users.id)
└── created_at (TIMESTAMP)
```

---

## ✅ **Verification Checklist**

- [ ] Main schema (supabase_schema.sql) executed successfully
- [ ] Social features schema (social_features_schema.sql) executed successfully
- [ ] All 11 tables created
- [ ] RLS policies enabled on all tables
- [ ] Triggers created for auto-updating counts
- [ ] Environment variables set correctly
- [ ] Test query runs without errors
- [ ] Application connects to database successfully

---

## 🚀 **Next Steps After Setup**

1. **Test User Signup**: Create a new account with SIT email
2. **Complete Profile**: Fill in profile information
3. **Create a Post**: Test post creation in news feed
4. **Create a Job**: Test job posting functionality
5. **Create an Event**: Test event creation
6. **Test Interactions**: Like posts, comment, bookmark jobs, register for events

---

## 📝 **Notes**

- All tables use UUID for primary keys
- Timestamps are in UTC with timezone
- JSONB fields allow flexible data storage
- Soft deletes used (is_deleted flag) instead of hard deletes
- Automatic count updates via database triggers
- Row Level Security ensures data privacy

---

**Last Updated:** 2025-09-30
**Database Version:** 1.0
**Status:** Production Ready ✅

