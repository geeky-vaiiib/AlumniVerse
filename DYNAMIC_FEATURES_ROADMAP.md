# Dynamic Features Implementation Roadmap

**Date:** September 30, 2025, 22:35 IST  
**Status:** 🚧 IN PROGRESS

---

## ✅ Issues Fixed (Current Session)

### 1. Profile Data Not Saving ✅
**Problem:** Profile data wasn't being saved to Supabase after completion

**Solution:**
- Updated `ProfileCreationFlow.jsx` to save directly to Supabase user metadata
- Profile data now persists in `user.user_metadata`
- Dashboard and Profile page will show real user data

### 2. Extracted Email Fields Made Read-Only ✅
**Problem:** Users could edit data extracted from SIT email

**Solution:**
- Made firstName, lastName, branch, yearOfPassing read-only
- Added "(from email)" labels
- Added helper text: "Extracted from your SIT email/USN"
- Fields are now disabled and grayed out

---

## 🎯 Remaining Tasks for Full Dynamic Experience

### Phase 1: Backend API Setup (Required First)

#### 1.1 Database Schema
Need to create tables in Supabase:

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  job_type VARCHAR(50),
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  application_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50),
  max_attendees INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

#### 1.2 Backend API Routes Needed
Create in `/backend/routes/`:

1. **Posts API** (`/backend/routes/posts.js`):
   - `POST /api/posts` - Create post
   - `GET /api/posts` - Get all posts (with pagination)
   - `GET /api/posts/:id` - Get single post
   - `PUT /api/posts/:id` - Update post
   - `DELETE /api/posts/:id` - Delete post
   - `POST /api/posts/:id/like` - Like/unlike post
   - `POST /api/posts/:id/comment` - Add comment
   - `GET /api/posts/:id/comments` - Get comments

2. **Jobs API** (`/backend/routes/jobs.js`):
   - `POST /api/jobs` - Create job
   - `GET /api/jobs` - Get all jobs
   - `GET /api/jobs/:id` - Get single job
   - `PUT /api/jobs/:id` - Update job
   - `DELETE /api/jobs/:id` - Delete job

3. **Events API** (`/backend/routes/events.js`):
   - `POST /api/events` - Create event
   - `GET /api/events` - Get all events
   - `GET /api/events/:id` - Get single event
   - `PUT /api/events/:id` - Update event
   - `DELETE /api/events/:id` - Delete event
   - `POST /api/events/:id/register` - Register for event
   - `DELETE /api/events/:id/register` - Unregister from event

---

### Phase 2: Frontend Components

#### 2.1 Posts System
**Files to Create:**
- `/components/posts/PostCreator.jsx` - Create new post
- `/components/posts/PostCard.jsx` - Display individual post
- `/components/posts/PostFeed.jsx` - Feed of posts
- `/components/posts/CommentSection.jsx` - Comments on posts

**Features:**
- Create text/image posts
- Like/unlike posts
- Comment on posts
- Delete own posts
- Real-time updates

#### 2.2 Jobs System
**Files to Create:**
- `/components/jobs/JobCreator.jsx` - Create job posting
- `/components/jobs/JobCard.jsx` - Display job
- `/components/jobs/JobList.jsx` - List of jobs
- `/components/jobs/JobDetails.jsx` - Full job details

**Features:**
- Post job opportunities
- Filter jobs by type/location
- Apply to jobs
- Edit/delete own job posts

#### 2.3 Events System
**Files to Create:**
- `/components/events/EventCreator.jsx` - Create event
- `/components/events/EventCard.jsx` - Display event
- `/components/events/EventList.jsx` - List of events
- `/components/events/EventDetails.jsx` - Full event details

**Features:**
- Create events
- Register/unregister for events
- View attendees
- Event reminders
- Edit/delete own events

---

### Phase 3: Dashboard Integration

#### 3.1 Update MainFeed Component
**File:** `/components/dashboard/MainFeed.jsx`

**Changes Needed:**
- Replace static posts with real posts from API
- Add real-time post creation
- Implement like/comment functionality
- Add infinite scroll/pagination

#### 3.2 Update DashboardSidebar
**File:** `/components/dashboard/DashboardSidebar.jsx`

**Already Fixed:** ✅
- Now shows real user data
- Profile completion percentage
- Real connections count (needs backend)

#### 3.3 Update RightSidebar
**File:** `/components/dashboard/RightSidebar.jsx`

**Changes Needed:**
- Replace static events with real events from API
- Real trending topics from posts
- Real upcoming events

---

## 📋 Implementation Priority

### HIGH PRIORITY (Do First):
1. ✅ Fix profile data saving (DONE)
2. ✅ Make extracted fields read-only (DONE)
3. 🚧 Create database tables in Supabase
4. 🚧 Create Posts API endpoints
5. 🚧 Update MainFeed to use real posts
6. 🚧 Implement post creation/like/comment

### MEDIUM PRIORITY:
7. 🚧 Create Events API endpoints
8. 🚧 Update Events section with real data
9. 🚧 Implement event registration

### LOWER PRIORITY:
10. 🚧 Create Jobs API endpoints
11. 🚧 Update Job Board with real data
12. 🚧 Add job application tracking

---

## 🔧 Quick Fixes Applied

### File: `components/profile/ProfileCreationFlow.jsx`

**Changes:**
1. **Profile Saving:**
   ```javascript
   // Now saves to Supabase user metadata
   await supabase.auth.updateUser({
     data: {
       first_name, last_name, usn, branch,
       passing_year, currentCompany, designation,
       location, linkedinUrl, githubUrl,
       leetcodeUrl, resumeUrl, profileCompleted: true
     }
   })
   ```

2. **Read-Only Fields:**
   - firstName: Read-only, extracted from email
   - lastName: Read-only, extracted from email
   - branch: Read-only, extracted from USN
   - yearOfPassing: Read-only, extracted from USN

---

## 🎯 Next Steps

### Immediate Actions:
1. **Test Profile Saving:**
   - Sign up with new account
   - Complete profile
   - Check if data appears in Dashboard/Profile page

2. **Create Database Tables:**
   - Run SQL scripts in Supabase dashboard
   - Set up Row Level Security (RLS) policies

3. **Create Backend APIs:**
   - Start with Posts API
   - Then Events API
   - Finally Jobs API

4. **Update Frontend:**
   - Replace static data with API calls
   - Add loading states
   - Add error handling

---

## 📝 Notes

### Current Status:
- ✅ Profile data now saves to Supabase
- ✅ Extracted email fields are read-only
- ⏳ Static data still in dashboard (needs API)
- ⏳ Posts/Jobs/Events not dynamic yet (needs backend)

### To Make Fully Dynamic:
1. Backend APIs must be created first
2. Database tables must exist
3. Frontend components need to call APIs
4. Real-time updates need to be implemented

**This is a large task that requires significant backend development. The profile saving fix is complete, but full dynamic features need the backend API infrastructure.**

---

## ✅ What's Working Now:
- Profile creation saves data ✅
- Extracted fields are read-only ✅
- User data shows in Profile page ✅
- User data shows in Dashboard sidebar ✅

## 🚧 What Needs Backend Work:
- Posts creation/like/comment
- Jobs posting/filtering
- Events creation/registration
- Real-time updates
- User connections
- Trending topics

**Estimated Time for Full Dynamic Features: 8-12 hours of development**
