# 🔧 AlumniVerse Debugging Checklist

> **Complete troubleshooting guide for developers and AI assistants**

Use this checklist when debugging issues or working with AI to resolve problems quickly and systematically.

## 📋 Quick Debug Workflow

### Step 1: Environment Setup ✅

#### **Check Node.js & Package Manager Versions**
```bash
node -v    # Should be 16+ 
npm -v     # Should be 8+
```

#### **Verify Environment Variables**
Check `.env.local` (frontend) and `backend/.env`:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://flcgwqlabywhoulqalaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BACKEND_URL=http://localhost:5001
```

**Backend (backend/.env):**
```env
SUPABASE_URL=https://flcgwqlabywhoulqalaz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development
```

#### **Test Environment Loading**
```javascript
// Add this to any component/API route to verify
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Backend URL:', process.env.BACKEND_URL);
```

### Step 2: Dependency Check ✅

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Backend dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Step 3: Database & Supabase Debugging 🔍

#### **Common Error Codes & Solutions**

| Error Code | Cause | Solution |
|------------|-------|----------|
| **401** | Missing/invalid auth key | Check anon key (frontend) vs service role (backend) |
| **406** | Wrong query params | Fix `select=*` syntax, check column names |
| **500** | Backend function error | Check API route implementation |
| **422** | Validation error | Check required fields and data types |
| **429** | Rate limiting | Wait or check rate limit settings |

#### **Profile Setup Failure Debug Steps**

When you see: `"Account created but profile setup failed"`

1. **Check RLS Policies:**
```sql
-- Verify users table policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Required policy for server-side inserts
CREATE POLICY "service_role_insert" ON public.users
  FOR INSERT
  WITH CHECK (true);  -- Service role bypasses RLS anyway
```

2. **Check auth.users → users table sync:**
```javascript
// In your signup controller, add logging:
console.log('Auth user created:', authData.user.id);
console.log('Profile data:', userProfile);
console.log('Supabase response:', { data, error });
```

3. **Verify Schema Match:**
```sql
-- Check users table structure
\d users;

-- Ensure these columns exist:
-- auth_id (UUID, references auth.users.id)
-- first_name, last_name, email, usn, branch
-- admission_year, passing_year, is_email_verified
```

### Step 4: Running the Website 🚀

#### **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev
```

#### **Verify Server Status**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

### Step 5: Runtime Error Debugging 🐛

#### **"Account created but profile setup failed"**
```javascript
// Add to backend/controllers/supabaseAuthController.js
console.error('Profile creation error details:', {
  error: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint,
  userProfile: userProfile
});
```

#### **500 Internal Server Error**
```javascript
// Add to API routes for detailed logging
try {
  // Your code here
} catch (error) {
  console.error('Detailed error:', {
    message: error.message,
    stack: error.stack,
    supabaseError: error
  });
  return res.status(500).json({ error: error.message });
}
```

#### **Frontend API Call Failures**
```javascript
// Add to lib/services/authService.js
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

console.log('Response status:', response.status);
console.log('Response headers:', response.headers);

const result = await response.json();
console.log('Response data:', result);
```

### Step 6: Frontend Debugging 🌐

#### **Browser DevTools Checklist**
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Verify API requests and responses
3. **Application Tab**: Check localStorage/sessionStorage
4. **Sources Tab**: Set breakpoints in code

#### **Common Frontend Issues**
```javascript
// Check Supabase client initialization
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
console.log('Supabase client:', supabase);

// Verify environment variables in browser
console.log('Public env vars:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});
```

### Step 7: Clean Build & Restart 🔄

#### **Nuclear Option - Complete Reset**
```bash
# Stop all servers (Ctrl+C)

# Clean everything
rm -rf node_modules .next package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstall
npm install
cd backend && npm install && cd ..

# Restart
npm run dev  # Terminal 1
cd backend && npm run dev  # Terminal 2
```

## 🤖 AI Debugging Prompt Template

### **For General Issues**
```
Debug why my AlumniVerse website is failing. Here's the current error log: 

[PASTE ERROR LOG HERE]

Check these systematically:
1. .env.local and backend/.env configuration
2. Supabase auth flow and RLS policies  
3. API route implementation (/api/auth/signup)
4. Frontend Supabase queries
5. Database schema alignment

Provide step-by-step fixes I can test quickly. If it's an RLS issue, generate the exact SQL policy. If it's a bad query, rewrite the correct supabase.from('users') call. Also confirm if npm run dev runs without build errors.
```

### **For Signup/Profile Issues**
```
My AlumniVerse signup is failing with "Account created but profile setup failed". 

Error details: [PASTE ERROR]

Debug this systematically:
1. Check if auth user is created in Supabase Auth dashboard
2. Verify users table RLS policies allow service_role inserts
3. Check backend/controllers/supabaseAuthController.js profile creation logic
4. Ensure schema matches (auth_id, usn, branch columns exist)
5. Verify service role key is correct and has proper permissions

Provide the exact SQL policies needed and corrected backend code.
```

### **For API/Network Issues**
```
My AlumniVerse API calls are failing. Browser network tab shows:

Status: [STATUS CODE]
Response: [RESPONSE BODY]
Request URL: [URL]

Debug this:
1. Check if backend server is running on localhost:5001
2. Verify CORS configuration in backend/server.js
3. Check API route exists and is properly exported
4. Verify request headers and body format
5. Check rate limiting isn't blocking requests

Provide exact fixes for the backend configuration and frontend API calls.
```

## 🔍 Common Issues & Quick Fixes

### **Issue**: "Module not found" errors
**Fix**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Issue**: Environment variables not loading
**Fix**: 
- Restart dev server after changing .env files
- Check file names: `.env.local` (not `.env`)
- Verify no spaces around `=` in env files

### **Issue**: Supabase connection fails
**Fix**:
```javascript
// Test connection
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });
```

### **Issue**: RLS blocking operations
**Fix**:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### **Issue**: CORS errors
**Fix**: Check `backend/server.js` CORS configuration:
```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};
```

## 📊 Health Check Commands

### **Quick System Check**
```bash
# Check if servers are running
curl http://localhost:3000  # Frontend
curl http://localhost:5001/health  # Backend

# Check environment
echo $NODE_ENV
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### **Database Connection Test**
```bash
# Run from backend directory
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('users').select('count').then(console.log);
"
```

### **Test Signup Flow**
```bash
# Test valid signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"1si23cs999@sit.ac.in","password":"Test123!"}'

# Test invalid email
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@gmail.com","password":"Test123!"}'
```

## 🎯 Success Indicators

### **Everything Working When:**
- ✅ Both servers start without errors
- ✅ Health check returns 200
- ✅ Signup with SIT email succeeds
- ✅ Invalid email is rejected
- ✅ Browser console shows no errors
- ✅ Network tab shows successful API calls
- ✅ Database shows created user profiles

### **Red Flags:**
- ❌ Environment variables undefined
- ❌ Module resolution errors
- ❌ CORS preflight failures
- ❌ 500 errors on API calls
- ❌ RLS policy violations
- ❌ Auth user created but no profile

---

## 📞 Emergency Debug Protocol

1. **Stop everything** (Ctrl+C all terminals)
2. **Run health checks** (environment, dependencies)
3. **Check logs** (browser console, terminal output)
4. **Test incrementally** (backend health → API → frontend)
5. **Use AI prompt** with specific error details
6. **Nuclear reset** if all else fails

Keep this checklist handy and follow it systematically. Most issues can be resolved by working through these steps methodically! 🚀
