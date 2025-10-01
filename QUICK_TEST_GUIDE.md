# Quick Testing Guide - AlumniVerse Auth Fixes

## 🚀 Servers Running
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **Auth Page:** http://localhost:3000/auth

---

## 📝 Test Signup Flow

### Step 1: Navigate to Signup
1. Go to http://localhost:3000/auth
2. You should see:
   - ✅ Navbar at the top
   - ✅ Dark background (consistent with other pages)
   - ✅ "Join AlumniVerse" card

### Step 2: Fill Signup Form
**Test Data:**
```
First Name: John
Last Name: Doe
Email: 1si23cs001@sit.ac.in
Password: Test@123
Confirm Password: Test@123
```

**What to Verify:**
- ✅ Password field has eye icon (toggle visibility)
- ✅ Confirm password field has eye icon
- ✅ Email shows extracted data:
  - USN: 1SI23CS001
  - Branch: Computer Science
  - Joining: 2023
  - Passing: 2027

### Step 3: OTP Verification
1. Click "Send Verification Code"
2. Enter any 6-digit code (e.g., 123456)
3. Verify:
   - ✅ Navbar still visible
   - ✅ Background consistent
   - ✅ Success message appears

### Step 4: Profile Creation
**Auto-Filled Fields (Don't Re-enter):**
- ✅ First Name: John
- ✅ Last Name: Doe
- ✅ Branch: Computer Science
- ✅ Year of Passing: 2027

**Fill These Fields:**
```
Step 1 - Personal Info:
  (Already filled - just click Next)

Step 2 - Professional:
  Current Company: Google
  Designation: Software Engineer
  Location: Bangalore, India
  Resume URL: https://drive.google.com/your-resume

Step 3 - Social Links (ALL REQUIRED):
  LinkedIn: https://linkedin.com/in/johndoe
  GitHub: https://github.com/johndoe
  LeetCode: https://leetcode.com/johndoe
```

**What to Verify:**
- ✅ Cannot skip social links (all required)
- ✅ Resume URL is required
- ✅ URL validation works
- ✅ Progress bar updates

### Step 5: Dashboard
1. After completing profile, you're redirected to dashboard
2. Verify:
   - ✅ Your real name appears (not "John Doe" static)
   - ✅ Your email shows
   - ✅ Your branch shows: Computer Science
   - ✅ Your batch shows: 2027
   - ✅ Company: Google
   - ✅ Designation: Software Engineer
   - ✅ Location: Bangalore, India

---

## 🔍 What Changed - Quick Visual Check

### Before vs After:

| Feature | Before ❌ | After ✅ |
|---------|----------|---------|
| Password during signup | No password field | Password + Confirm Password with validation |
| Profile completion | Skipped | Required: LinkedIn, GitHub, LeetCode, Resume |
| Auto-fill data | Manual entry | Auto-filled from email (USN, Branch, Year) |
| Dashboard data | "John Doe" static | Real user data |
| Auth page navbar | Missing | Present and functional |
| Background | Inconsistent | Unified dark theme |

---

## 🐛 Common Issues & Solutions

### Issue: "Password must contain uppercase, lowercase, and number"
**Solution:** Use a password like `Test@123` or `MyPass123`

### Issue: "LinkedIn profile URL is required"
**Solution:** All social links are now required. Use format:
- LinkedIn: `https://linkedin.com/in/username`
- GitHub: `https://github.com/username`
- LeetCode: `https://leetcode.com/username`

### Issue: Can't see extracted data
**Solution:** Make sure email ends with `@sit.ac.in` and follows format: `1si23cs001@sit.ac.in`

### Issue: Dashboard shows "User" instead of name
**Solution:** This is the fallback. Complete the profile creation flow to see your real name.

---

## ✅ Success Criteria

Your implementation is working if:
1. ✅ Password is required during signup
2. ✅ Password has validation (8+ chars, uppercase, lowercase, number)
3. ✅ Email data auto-extracts and displays
4. ✅ Profile creation asks for LinkedIn, GitHub, LeetCode, Resume
5. ✅ All profile fields are required
6. ✅ Dashboard shows YOUR data, not "John Doe"
7. ✅ Navbar appears on auth pages
8. ✅ Background is consistent across all pages

---

## 🎯 Quick Commands

### Check Servers:
```bash
# Backend health
curl http://localhost:5001/health

# Frontend
curl http://localhost:3000
```

### Restart Servers:
```bash
# Kill all
pkill -f "next dev" && pkill -f "nodemon"

# Start backend
cd backend && npm run dev &

# Start frontend
npm run dev &
```

---

## 📞 Need Help?

All changes documented in:
- `AUTH_FIXES_SUMMARY.md` - Complete technical details
- `PROTO_MERGE_ANALYSIS.md` - Merge verification
- `FIXES_APPLIED.md` - CSS fixes

**Status:** All systems operational! Ready for testing! 🚀
