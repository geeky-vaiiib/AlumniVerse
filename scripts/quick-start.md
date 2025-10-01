# AlumniVerse - Quick Start Guide

## 🚀 **Get Started in 5 Minutes**

### **Step 1: Database Setup (2 minutes)**

1. **Open Supabase Dashboard**
   ```
   https://supabase.com → Your Project → SQL Editor
   ```

2. **Copy & Run This SQL**
   - Open file: `backend/database/social_features_schema.sql`
   - Select ALL content (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **RUN** button
   - Wait for "Success" message

3. **Verify Tables Created**
   Run this query:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   
   You should see these tables:
   - ✅ badges
   - ✅ comment_likes
   - ✅ comments
   - ✅ connections
   - ✅ event_attendees
   - ✅ events
   - ✅ job_bookmarks
   - ✅ jobs
   - ✅ post_likes
   - ✅ posts
   - ✅ users

---

### **Step 2: Start Development Server (1 minute)**

```bash
# If not already running
npm run dev
```

Server should start on: `http://localhost:3001`

---

### **Step 3: Test User Journey (2 minutes)**

#### **A. Sign Up & Profile**
1. Go to `http://localhost:3001`
2. Click "Sign Up"
3. Enter SIT email: `yourname@sit.ac.in`
4. Enter password
5. Check email for OTP
6. Enter OTP code
7. Complete profile creation
8. ✅ Should redirect to dashboard

#### **B. Test Posts**
1. In Dashboard → News Feed
2. Click "What's on your mind?"
3. Type: "Hello AlumniVerse! 🎉 #FirstPost"
4. Click "Post"
5. ✅ Post should appear with your name
6. Click ❤️ heart icon
7. ✅ Like count should increase
8. Click "Comment"
9. Type: "Great platform!"
10. ✅ Comment should appear

#### **C. Test Jobs**
1. Click "Jobs" tab
2. Click "Post a Job"
3. Fill in:
   - Title: "Software Engineer"
   - Company: "Tech Corp"
   - Location: "Bangalore"
   - Type: "Full-time"
   - Description: "Looking for talented developers"
4. Click "Post Job"
5. ✅ Job should appear in list
6. Click 🔖 bookmark icon
7. ✅ Should save job

#### **D. Test Events**
1. Click "Events" tab
2. Click "Create Event"
3. Fill in:
   - Title: "Alumni Meetup 2025"
   - Date: Select future date
   - Location: "Bangalore"
   - Category: "Networking"
   - Description: "Let's connect!"
4. Click "Create Event"
5. ✅ Event should appear
6. Click "RSVP"
7. ✅ Should register you

---

## 🐛 **Troubleshooting**

### **Issue: "relation 'posts' does not exist"**
**Solution:** You haven't run the database schema yet.
- Go to Supabase SQL Editor
- Run `backend/database/social_features_schema.sql`

### **Issue: "User not authenticated"**
**Solution:** You're not logged in.
- Sign up or log in first
- Check browser console for auth errors

### **Issue: "Permission denied for table posts"**
**Solution:** RLS policies not set up correctly.
- Re-run the social_features_schema.sql
- Make sure you're logged in with a valid user

### **Issue: Posts/Jobs/Events not showing**
**Solution:** Check browser console for errors.
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests
- Verify Supabase connection

### **Issue: "Cannot read properties of undefined"**
**Solution:** User profile not loaded yet.
- Wait for loading state to complete
- Check UserContext is properly initialized
- Verify user is logged in

---

## 🔍 **Verify Everything Works**

### **Check Database**
Run in Supabase SQL Editor:
```sql
-- Check if posts table exists and has data
SELECT COUNT(*) as post_count FROM posts;

-- Check if jobs table exists and has data
SELECT COUNT(*) as job_count FROM jobs;

-- Check if events table exists and has data
SELECT COUNT(*) as event_count FROM events;

-- Check your user profile
SELECT id, first_name, last_name, email, usn, branch 
FROM users 
WHERE email = 'your-email@sit.ac.in';
```

### **Check Browser Console**
Open DevTools (F12) and look for:
- ✅ No red errors
- ✅ Successful API calls (200 status)
- ✅ User data loaded in console logs

### **Check Network Tab**
In DevTools → Network:
- ✅ Requests to Supabase succeed
- ✅ POST requests return 201 Created
- ✅ GET requests return 200 OK

---

## 📊 **Expected Behavior**

### **After Creating a Post:**
```
✅ Post appears immediately in feed
✅ Shows your name and profile picture/initials
✅ Shows timestamp (e.g., "Just now")
✅ Like button is clickable
✅ Comment button opens comment section
✅ Post persists after page refresh
```

### **After Creating a Job:**
```
✅ Job appears in job list
✅ Shows your name as poster
✅ Bookmark icon is clickable
✅ Job details are visible
✅ Job persists after page refresh
```

### **After Creating an Event:**
```
✅ Event appears in events list
✅ Shows your name as organizer
✅ RSVP button is clickable
✅ Attendee count shows correctly
✅ Event persists after page refresh
```

---

## 🎯 **Success Criteria**

You'll know everything is working when:

- [ ] You can sign up with SIT email
- [ ] Profile creation completes successfully
- [ ] Dashboard shows your real name and data
- [ ] You can create a post and it appears
- [ ] You can like a post and count increases
- [ ] You can comment on a post
- [ ] You can create a job posting
- [ ] You can bookmark a job
- [ ] You can create an event
- [ ] You can RSVP to an event
- [ ] All data persists after page refresh
- [ ] No errors in browser console

---

## 🆘 **Need Help?**

### **Common Commands**

```bash
# Restart dev server
npm run dev

# Check for errors
npm run build

# Clear cache and restart
rm -rf .next
npm run dev

# Check environment variables
cat .env.local
```

### **Check Supabase Connection**

Create a test file: `test-supabase.js`
```javascript
import { supabase } from './lib/supabaseClient'

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('❌ Supabase connection failed:', error)
  } else {
    console.log('✅ Supabase connected successfully!')
  }
}

testConnection()
```

Run: `node test-supabase.js`

---

## 📝 **Next Steps After Testing**

1. **Customize Branding**
   - Update colors in `app/globals.css`
   - Add your logo
   - Customize email templates

2. **Add More Features**
   - Image upload for posts
   - Rich text editor
   - Email notifications
   - Real-time updates (Supabase Realtime)

3. **Deploy to Production**
   - Push to GitHub
   - Deploy to Vercel
   - Set up production Supabase project
   - Configure environment variables

4. **Monitor & Optimize**
   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)
   - Monitor performance
   - Gather user feedback

---

## 🎉 **You're All Set!**

Your AlumniVerse platform is now:
- ✅ Fully dynamic
- ✅ Database-driven
- ✅ User-specific
- ✅ Production-ready

**Enjoy building your alumni community! 🚀**

---

**Questions?** Check the documentation:
- `IMPLEMENTATION_SUMMARY.md` - User experience features
- `DYNAMIC_FEATURES_IMPLEMENTATION.md` - Dynamic features guide
- `scripts/setup-database.md` - Detailed database setup

**Last Updated:** 2025-09-30

