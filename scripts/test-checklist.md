# AlumniVerse - Complete Testing Checklist

## 🧪 **Comprehensive Testing Guide**

### **Pre-Testing Setup**
- [ ] Database schema executed in Supabase
- [ ] All tables created (11 tables)
- [ ] RLS policies enabled
- [ ] Environment variables set (.env.local)
- [ ] Development server running (npm run dev)
- [ ] Browser DevTools open (F12)

---

## 1️⃣ **Authentication Flow Testing**

### **Sign Up Flow**
- [ ] Navigate to homepage
- [ ] Click "Sign Up" button
- [ ] Enter valid SIT email (e.g., `1si23is117@sit.ac.in`)
- [ ] Enter first name
- [ ] Enter last name
- [ ] Enter password (min 8 characters)
- [ ] Confirm password matches
- [ ] Click "Sign Up"
- [ ] Verify OTP sent to email
- [ ] Enter OTP code
- [ ] Click "Verify"
- [ ] **Expected:** Redirect to profile creation

### **Profile Creation Flow**
- [ ] Verify first name pre-filled (from email)
- [ ] Verify last name pre-filled (from email)
- [ ] Verify USN extracted and shown
- [ ] Verify branch extracted and shown (read-only)
- [ ] Verify graduation year extracted (read-only)
- [ ] Enter current company
- [ ] Enter designation
- [ ] Enter location
- [ ] Enter LinkedIn URL (optional)
- [ ] Enter GitHub URL (optional)
- [ ] Enter LeetCode URL (optional)
- [ ] Click "Complete Profile"
- [ ] **Expected:** Redirect to dashboard

### **Login Flow**
- [ ] Navigate to homepage
- [ ] Click "Login" button
- [ ] Enter email
- [ ] Enter password
- [ ] Click "Login"
- [ ] **Expected:** Redirect to dashboard

### **Logout Flow**
- [ ] Click user menu/profile
- [ ] Click "Logout"
- [ ] **Expected:** Redirect to homepage
- [ ] **Expected:** Session cleared

---

## 2️⃣ **User Profile Testing**

### **Profile Display**
- [ ] Dashboard shows correct first name + last name
- [ ] USN displayed correctly
- [ ] Branch displayed correctly
- [ ] Graduation year displayed correctly
- [ ] Company displayed correctly
- [ ] Designation displayed correctly
- [ ] Location displayed correctly
- [ ] Profile completion percentage shown
- [ ] Avatar/initials displayed

### **Social Links**
- [ ] LinkedIn icon visible (if URL provided)
- [ ] GitHub icon visible (if URL provided)
- [ ] LeetCode icon visible (if URL provided)
- [ ] Icons are clickable
- [ ] Links open in new tab

### **Profile Card**
- [ ] UserProfileCard shows real data
- [ ] DashboardSidebar shows real data
- [ ] No "random verified name" or mock data
- [ ] Profile completion bar accurate

---

## 3️⃣ **Posts & News Feed Testing**

### **View Posts**
- [ ] News feed loads without errors
- [ ] Posts display with author names
- [ ] Post timestamps shown correctly
- [ ] Like counts visible
- [ ] Comment counts visible
- [ ] Loading state appears while fetching

### **Create Post**
- [ ] Click "What's on your mind?" or "Create Post"
- [ ] Modal/form opens
- [ ] Enter post content: "Testing AlumniVerse posts! #Test"
- [ ] Add hashtags (e.g., #AlumniVerse #Testing)
- [ ] Click "Post" button
- [ ] **Expected:** Post appears immediately in feed
- [ ] **Expected:** Shows your name as author
- [ ] **Expected:** Shows "Just now" timestamp
- [ ] **Expected:** Like count = 0, Comments count = 0

### **Like Post**
- [ ] Click heart/like icon on any post
- [ ] **Expected:** Like count increases by 1
- [ ] **Expected:** Heart icon changes color/fills
- [ ] Click heart again to unlike
- [ ] **Expected:** Like count decreases by 1
- [ ] **Expected:** Heart icon returns to outline
- [ ] Refresh page
- [ ] **Expected:** Like state persists

### **Comment on Post**
- [ ] Click "Comment" button on any post
- [ ] Comment input appears
- [ ] Enter comment: "Great post!"
- [ ] Click "Send" or press Enter
- [ ] **Expected:** Comment appears immediately
- [ ] **Expected:** Shows your name as commenter
- [ ] **Expected:** Comment count increases
- [ ] Refresh page
- [ ] **Expected:** Comment persists

### **Post Persistence**
- [ ] Refresh browser (F5)
- [ ] **Expected:** All posts still visible
- [ ] **Expected:** Likes and comments preserved
- [ ] Open in incognito/private window
- [ ] **Expected:** Posts visible to other users

---

## 4️⃣ **Job Board Testing**

### **View Jobs**
- [ ] Navigate to Jobs tab
- [ ] Jobs list loads without errors
- [ ] Jobs display with company names
- [ ] Job locations shown
- [ ] Job types shown (Full-time, Internship, etc.)
- [ ] Posted by information visible

### **Create Job**
- [ ] Click "Post a Job" button
- [ ] Modal/form opens
- [ ] Fill in job details:
  - Title: "Senior Software Engineer"
  - Company: "Tech Innovations Inc"
  - Location: "Bangalore, India"
  - Type: "Full-time"
  - Experience Level: "Mid"
  - Salary Range: "15-25 LPA"
  - Description: "We're looking for talented developers..."
  - Required Skills: ["React", "Node.js", "MongoDB"]
  - Application URL: "https://example.com/apply"
- [ ] Click "Post Job"
- [ ] **Expected:** Job appears in list immediately
- [ ] **Expected:** Shows your name as poster
- [ ] **Expected:** All details visible

### **Bookmark Job**
- [ ] Click bookmark icon on any job
- [ ] **Expected:** Icon fills/changes color
- [ ] **Expected:** Toast notification: "Job saved successfully!"
- [ ] Click bookmark again
- [ ] **Expected:** Icon returns to outline
- [ ] **Expected:** Toast notification: "Job removed from saved list"
- [ ] Refresh page
- [ ] **Expected:** Bookmark state persists

### **Filter Jobs**
- [ ] Use "Type" filter dropdown
- [ ] Select "Full-time"
- [ ] **Expected:** Only full-time jobs shown
- [ ] Use "Experience Level" filter
- [ ] Select "Mid"
- [ ] **Expected:** Only mid-level jobs shown
- [ ] Clear filters
- [ ] **Expected:** All jobs shown again

### **Job Persistence**
- [ ] Refresh browser
- [ ] **Expected:** All jobs still visible
- [ ] **Expected:** Bookmarks preserved

---

## 5️⃣ **Events System Testing**

### **View Events**
- [ ] Navigate to Events tab
- [ ] Events list loads without errors
- [ ] Events display with titles
- [ ] Event dates shown
- [ ] Event locations shown
- [ ] Organizer information visible
- [ ] Attendee counts shown

### **Create Event**
- [ ] Click "Create Event" button
- [ ] Modal/form opens
- [ ] Fill in event details:
  - Title: "Alumni Networking Meetup 2025"
  - Date: Select future date (e.g., next month)
  - Time: Select time
  - Location: "Bangalore Tech Park"
  - Category: "Networking"
  - Description: "Join us for an evening of networking..."
  - Max Attendees: 50
  - Is Virtual: No
- [ ] Click "Create Event"
- [ ] **Expected:** Event appears in list immediately
- [ ] **Expected:** Shows your name as organizer
- [ ] **Expected:** Attendee count = 0

### **Register for Event (RSVP)**
- [ ] Click "RSVP" or "Register" button on any event
- [ ] **Expected:** Button changes to "Registered" or "Cancel"
- [ ] **Expected:** Attendee count increases by 1
- [ ] **Expected:** Toast notification: "Successfully registered!"
- [ ] Click "Cancel" to unregister
- [ ] **Expected:** Button returns to "RSVP"
- [ ] **Expected:** Attendee count decreases by 1
- [ ] Refresh page
- [ ] **Expected:** Registration state persists

### **Virtual Event**
- [ ] Create a virtual event
- [ ] Check "Is Virtual" checkbox
- [ ] Enter meeting link: "https://meet.google.com/abc-defg-hij"
- [ ] Click "Create Event"
- [ ] **Expected:** Event shows "Virtual" badge
- [ ] **Expected:** Meeting link visible to registered users

### **Event Persistence**
- [ ] Refresh browser
- [ ] **Expected:** All events still visible
- [ ] **Expected:** Registrations preserved

---

## 6️⃣ **Platform Stats Testing**

### **Right Sidebar Stats**
- [ ] Navigate to Dashboard
- [ ] Check "Platform Stats" card
- [ ] **Expected:** Total Alumni count (real number from DB)
- [ ] **Expected:** Active Users percentage
- [ ] **Expected:** New Connections count
- [ ] **Expected:** Upcoming Events count
- [ ] **Expected:** No hardcoded "1247" or mock numbers

### **Recent Updates**
- [ ] Check "Updates Panel" card
- [ ] **Expected:** Shows recent events from database
- [ ] **Expected:** Shows recent jobs from database
- [ ] **Expected:** No hardcoded "Video Calls" or mock updates

### **Suggested Connections**
- [ ] Check "Connect With Alumni" card
- [ ] **Expected:** Shows real users from database
- [ ] **Expected:** No hardcoded "Sarah Johnson" or mock users
- [ ] **Expected:** Shows actual companies and batch years

---

## 7️⃣ **User-Specific Experience Testing**

### **Test with Multiple Users**
- [ ] Create User A account
- [ ] Create posts, jobs, events as User A
- [ ] Logout
- [ ] Create User B account
- [ ] **Expected:** User B sees User A's posts
- [ ] **Expected:** User B has own profile data
- [ ] **Expected:** User B can create own content
- [ ] **Expected:** User B's likes/bookmarks separate from User A

### **Data Isolation**
- [ ] User A's bookmarks not visible to User B
- [ ] User A's registrations not visible to User B
- [ ] Each user sees own profile completion
- [ ] Each user sees own connections count

---

## 8️⃣ **Error Handling Testing**

### **Network Errors**
- [ ] Disconnect internet
- [ ] Try to create post
- [ ] **Expected:** Error message shown
- [ ] **Expected:** No crash or blank screen
- [ ] Reconnect internet
- [ ] **Expected:** Can retry successfully

### **Validation Errors**
- [ ] Try to create post with empty content
- [ ] **Expected:** Validation error shown
- [ ] Try to create job without required fields
- [ ] **Expected:** Validation error shown

### **Authentication Errors**
- [ ] Logout
- [ ] Try to create post (if possible)
- [ ] **Expected:** "Please log in" message
- [ ] **Expected:** Redirect to login

---

## 9️⃣ **Performance Testing**

### **Load Times**
- [ ] Dashboard loads in < 2 seconds
- [ ] Posts load in < 1 second
- [ ] Jobs load in < 1 second
- [ ] Events load in < 1 second
- [ ] No infinite loading spinners

### **Interactions**
- [ ] Like button responds instantly
- [ ] Comment submission instant
- [ ] Bookmark toggle instant
- [ ] RSVP toggle instant

---

## 🔟 **Browser Console Testing**

### **Check for Errors**
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] **Expected:** No red errors
- [ ] **Expected:** No "undefined" errors
- [ ] **Expected:** No "Cannot read properties" errors

### **Check Network Requests**
- [ ] Go to Network tab
- [ ] Create a post
- [ ] **Expected:** POST request to Supabase
- [ ] **Expected:** Status 201 Created
- [ ] Like a post
- [ ] **Expected:** POST/DELETE request to Supabase
- [ ] **Expected:** Status 200 OK

---

## ✅ **Final Verification**

### **Database Check**
Run in Supabase SQL Editor:
```sql
-- Check your posts
SELECT * FROM posts WHERE author_id = 'your-user-id';

-- Check your jobs
SELECT * FROM jobs WHERE posted_by = 'your-user-id';

-- Check your events
SELECT * FROM events WHERE organized_by = 'your-user-id';

-- Check your likes
SELECT * FROM post_likes WHERE user_id = 'your-user-id';

-- Check your bookmarks
SELECT * FROM job_bookmarks WHERE user_id = 'your-user-id';

-- Check your event registrations
SELECT * FROM event_attendees WHERE user_id = 'your-user-id';
```

### **Success Criteria**
- [ ] All 11 database tables exist
- [ ] User can sign up and create profile
- [ ] User can create posts, jobs, events
- [ ] User can like, comment, bookmark, RSVP
- [ ] All data persists after refresh
- [ ] No errors in console
- [ ] All API calls succeed
- [ ] User-specific data isolated
- [ ] Platform stats show real numbers
- [ ] No mock/static data visible

---

## 🎉 **Testing Complete!**

If all checkboxes are checked, your AlumniVerse platform is:
- ✅ Fully functional
- ✅ Database-driven
- ✅ User-specific
- ✅ Production-ready

**Congratulations! 🚀**

---

**Last Updated:** 2025-09-30
**Test Coverage:** 100+ Test Cases

