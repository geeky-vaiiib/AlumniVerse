# AlumniVerse - System Architecture

## 🏗️ **Complete System Architecture**

### **High-Level Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Next.js 14 App Router + React Components + Tailwind CSS        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AppContext  │  │ UserContext  │  │ AuthContext  │          │
│  │  (Global)    │  │  (Profile)   │  │   (Auth)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CUSTOM HOOKS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ usePosts │  │ useJobs  │  │useEvents │  │ useUser  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API SERVICES                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │posts.js  │  │ jobs.js  │  │events.js │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                               │
│              Authentication + Database + Storage                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                               │
│  ┌────────────────────────────────────────────────────┐         │
│  │  PostgreSQL Database                                │         │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │         │
│  │  │users │ │posts │ │jobs  │ │events│ │likes │    │         │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │         │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │         │
│  │  │comments  │ │bookmarks │ │attendees │          │         │
│  │  └──────────┘ └──────────┘ └──────────┘          │         │
│  └────────────────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Row Level Security (RLS) Policies                 │         │
│  │  - User can only modify own data                   │         │
│  │  - Public read access for posts/jobs/events        │         │
│  └────────────────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Database Triggers & Functions                     │         │
│  │  - Auto-update like counts                         │         │
│  │  - Auto-update comment counts                      │         │
│  │  - Auto-update timestamps                          │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Data Flow Diagrams**

### **1. User Authentication Flow**

```
User enters email/password
         │
         ▼
   AuthProvider
         │
         ▼
  Supabase Auth
         │
         ├─── Success ──→ Create session
         │                      │
         │                      ▼
         │              UserContext fetches profile
         │                      │
         │                      ▼
         │              Redirect to Dashboard
         │
         └─── Failure ──→ Show error message
```

### **2. Post Creation Flow**

```
User writes post content
         │
         ▼
   NewsFeed component
         │
         ▼
   usePosts().createPost()
         │
         ▼
   postsAPI.createPost()
         │
         ├─── Validate user auth
         │
         ▼
   Supabase INSERT into posts table
         │
         ├─── author_id = current user
         │
         ▼
   Return post with author details (JOIN users)
         │
         ▼
   AppContext.ADD_POST action
         │
         ▼
   UI updates with new post
         │
         ▼
   Toast notification shown
```

### **3. Like Post Flow**

```
User clicks like button
         │
         ▼
   usePosts().likePost()
         │
         ▼
   postsAPI.togglePostLike()
         │
         ├─── Check if already liked
         │    (SELECT from post_likes)
         │
         ├─── If liked: DELETE from post_likes
         │    If not liked: INSERT into post_likes
         │
         ▼
   Database trigger fires
         │
         ▼
   Auto-update posts.likes_count
         │
         ▼
   AppContext.LIKE_POST action
         │
         ▼
   UI updates like count & icon
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **users**
```sql
users
├── id (UUID, PK)
├── auth_id (UUID, UNIQUE) → Links to Supabase auth.users
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── usn (VARCHAR, UNIQUE)
├── branch (VARCHAR)
├── admission_year (INTEGER)
├── passing_year (INTEGER)
├── current_position (VARCHAR)
├── company (VARCHAR)
├── location (VARCHAR)
├── linkedin_url (TEXT)
├── github_url (TEXT)
├── leetcode_url (TEXT)
├── is_profile_complete (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **posts**
```sql
posts
├── id (UUID, PK)
├── author_id (UUID, FK → users.id)
├── content (TEXT)
├── post_type (VARCHAR) → 'general', 'achievement', 'question', etc.
├── images (JSONB) → Array of image URLs
├── links (JSONB) → Array of link objects
├── tags (JSONB) → Array of hashtags
├── likes_count (INTEGER) → Auto-updated by trigger
├── comments_count (INTEGER) → Auto-updated by trigger
├── is_deleted (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **jobs**
```sql
jobs
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── company (VARCHAR)
├── location (VARCHAR)
├── type (VARCHAR) → 'job', 'internship'
├── experience_level (VARCHAR) → 'entry', 'mid', 'senior'
├── salary_range (VARCHAR)
├── required_skills (JSONB)
├── application_url (TEXT)
├── posted_by (UUID, FK → users.id)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **events**
```sql
events
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── category (VARCHAR) → 'reunion', 'networking', 'workshop', etc.
├── event_date (TIMESTAMP)
├── location (VARCHAR)
├── is_virtual (BOOLEAN)
├── meeting_link (TEXT)
├── max_attendees (INTEGER)
├── organized_by (UUID, FK → users.id)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### **Relationship Tables**

#### **post_likes**
```sql
post_likes
├── id (UUID, PK)
├── post_id (UUID, FK → posts.id)
├── user_id (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── UNIQUE(post_id, user_id)
```

#### **comments**
```sql
comments
├── id (UUID, PK)
├── post_id (UUID, FK → posts.id)
├── author_id (UUID, FK → users.id)
├── parent_comment_id (UUID, FK → comments.id) → For nested replies
├── content (TEXT)
├── likes_count (INTEGER)
├── is_deleted (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **job_bookmarks**
```sql
job_bookmarks
├── id (UUID, PK)
├── job_id (UUID, FK → jobs.id)
├── user_id (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── UNIQUE(job_id, user_id)
```

#### **event_attendees**
```sql
event_attendees
├── id (UUID, PK)
├── event_id (UUID, FK → events.id)
├── user_id (UUID, FK → users.id)
├── attendance_status (VARCHAR) → 'registered', 'attended', 'cancelled'
├── registered_at (TIMESTAMP)
└── UNIQUE(event_id, user_id)
```

---

## 🔐 **Security Architecture**

### **Row Level Security (RLS) Policies**

```sql
-- Posts: Anyone can read, only author can modify
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Likes: Anyone can read, users can like as themselves
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);
```

### **Authentication Flow**

```
1. User signs up with email/password
   ↓
2. Supabase creates auth.users record
   ↓
3. OTP sent to email
   ↓
4. User verifies OTP
   ↓
5. Session created with JWT token
   ↓
6. Profile created in public.users table
   ↓
7. User metadata stored in auth.users.user_metadata
   ↓
8. JWT token includes user_id for RLS policies
```

---

## ⚡ **Performance Optimizations**

### **Database Indexes**

```sql
-- Fast lookups by author
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_events_organized_by ON events(organized_by);

-- Fast chronological sorting
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_events_event_date ON events(event_date ASC);

-- Fast filtering
CREATE INDEX idx_posts_deleted ON posts(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_jobs_active ON jobs(is_active) WHERE is_active = true;
```

### **Query Optimization**

```javascript
// Single query with JOIN instead of multiple queries
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:users!author_id (
      id, first_name, last_name, avatar_path
    )
  `)
  .eq('is_deleted', false)
  .order('created_at', { ascending: false })
  .limit(50)
```

### **Caching Strategy**

```javascript
// AppContext caches data to avoid refetching
const [posts, setPosts] = useState([])

// Only refetch when needed
useEffect(() => {
  if (posts.length === 0) {
    loadPosts()
  }
}, [])
```

---

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                     │
│  - Next.js App                                          │
│  - Static Assets                                        │
│  - Edge Functions                                       │
│  - CDN Distribution                                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend)                       │
│  - PostgreSQL Database                                  │
│  - Authentication Service                               │
│  - Storage (for images/files)                          │
│  - Real-time Subscriptions                             │
│  - Edge Functions                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 **Component Architecture**

```
app/
├── layout.jsx → Root layout with providers
├── page.jsx → Homepage
├── dashboard/
│   └── page.jsx → Dashboard page
└── auth/
    └── page.jsx → Auth flow page

components/
├── auth/
│   ├── SignUpForm.jsx
│   ├── LoginForm.jsx
│   └── OTPVerification.jsx
├── dashboard/
│   ├── Dashboard.jsx
│   ├── DashboardSidebar.jsx
│   ├── NewsFeed.jsx
│   ├── JobBoard.jsx
│   ├── EventsCalendar.jsx
│   ├── UserProfileCard.jsx
│   └── RightSidebar.jsx
├── profile/
│   └── ProfileCreationFlow.jsx
└── ui/
    ├── Button.jsx
    ├── Card.jsx
    ├── Input.jsx
    └── ErrorBoundary.jsx

contexts/
├── AppContext.jsx → Global state
├── UserContext.jsx → User profile
└── AuthContext.jsx → Authentication

hooks/
├── useRealTime.js → Posts, Jobs, Events hooks
└── usePlatformStats.js → Platform statistics

lib/
├── supabaseClient.js → Supabase initialization
├── utils.js → Utility functions
└── api/
    ├── posts.js → Posts API
    ├── jobs.js → Jobs API
    └── events.js → Events API
```

---

**Last Updated:** 2025-09-30
**Architecture Version:** 2.0
**Status:** Production Ready ✅

