# OTP Redirect Fix - Complete Runbook

## 🚨 Root Cause Analysis

The OTP verification redirect loop was caused by **three main issues**:

### 1. **Hard Window Redirects vs Router Navigation**
- **Problem**: `window.location.href` redirects in OTP verification and AuthFlow
- **Impact**: Bypassed Next.js client-side router, caused full page reloads
- **Solution**: Replaced with `router.push()` for SPA navigation

### 2. **Session Propagation Race Condition**  
- **Problem**: 400ms delay insufficient for session to propagate to middleware
- **Impact**: Middleware saw stale session state, triggered redirects
- **Solution**: Increased to 800ms delay + improved session handling

### 3. **Middleware Too Aggressive**
- **Problem**: No whitelist for auth callback/verification paths
- **Impact**: Middleware redirected users during active auth flows
- **Solution**: Added auth path whitelist to prevent interruption

## 🔧 Changes Made

### File: `components/auth/OTPVerification.jsx`
```diff
- // Use hard navigation to ensure session cookies are properly set
- // This forces a full page reload with the new session  
- window.location.href = '/dashboard'
+ // FIXED: Use router navigation instead of hard window.location redirect
+ // This prevents middleware redirect loops and preserves SPA state
+ if (isSignUp) {
+   onStepChange('profile', { email, firstName, lastName, isSignUp, userData })
+ } else {
+   router.push('/dashboard') 
+ }
```

### File: `components/auth/AuthFlow.jsx`
```diff
- // Use hard navigation to ensure cookies are sent
- window.location.href = redirectTo
+ // FIXED: Use router navigation instead of hard redirect to prevent loops
+ router.push(redirectTo)
```

### File: `components/providers/AuthProvider.jsx`
```diff
- // Wait for session to propagate
- await new Promise(resolve => setTimeout(resolve, 400))
+ // FIXED: Increased wait time for session to fully propagate
+ await new Promise(resolve => setTimeout(resolve, 800))
```

### File: `middleware.js`
```diff
+ // Add whitelist for auth callbacks and verification flows
+ const authWhitelist = ['/auth/callback', '/auth/verify', '/api/auth', '/api/profile']
+ 
+ // Always allow whitelisted auth paths to prevent interrupting auth flows
+ if (isAuthWhitelisted) {
+   return supabaseResponse
+ }
```

## 🧪 Testing & Verification

### Manual Testing Steps:
1. **Clean State**: Incognito window, clear cookies/localStorage
2. **Signup Flow**: Fill form → Request OTP → Verify OTP → Profile Creation → Dashboard
3. **Login Flow**: Email → Request OTP → Verify OTP → Dashboard
4. **Monitor**: Console logs with `[TEMP]` prefix for debugging

### Expected Success Criteria:
- ✅ No redirect loops between `/auth` ↔ `/dashboard`
- ✅ Smooth navigation via router, not page reloads
- ✅ Session persists correctly across navigation
- ✅ Middleware logs show consistent session state
- ✅ Profile creation completes successfully

### Test Scripts:
- `node test-otp-redirect-issue.js` - Basic flow testing
- `node test-profile-api.js` - API endpoint validation  
- `npx playwright test test-otp-redirect-e2e.spec.js` - E2E testing

## 🔍 Debugging Commands

### Browser Console:
```javascript
// Check current session
supabase.auth.getSession().then(({data}) => console.log('Session:', data.session));

// Clear all auth data
document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
localStorage.clear();
sessionStorage.clear();

// Monitor auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth change:', event, session?.user?.email);
});
```

### Server Logs to Monitor:
```
🔐 [TEMP] AuthProvider: Starting OTP verification
🔐 [TEMP] AuthProvider: OTP verification successful  
🔐 [TEMP] AuthProvider: Fresh session retrieved
🔐 [TEMP] OTPVerification: Using router.push instead of window.location
🛡️ [TEMP] Middleware: Route analysis (decision: ALLOW/WHITELIST_ALLOW)
```

### Red Flags (Indicate Problems):
```
🛡️ [TEMP] Middleware: decision: REDIRECT_TO_AUTH 
🛡️ [TEMP] Middleware: decision: REDIRECT_FROM_AUTH
```
*Rapid alternating between these indicates redirect loop*

## 📋 Deployment Checklist

### Pre-Deploy:
- [ ] Remove all `[TEMP]` debug logs from code
- [ ] Test signup flow in clean browser environment
- [ ] Test login flow with existing user
- [ ] Verify middleware behavior on protected routes
- [ ] Test session persistence across page reloads
- [ ] Validate profile creation API responses

### Deploy:
- [ ] Merge `debug/otp-redirect-fix` branch to main
- [ ] Deploy to staging environment first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Monitor logs for any new issues

### Post-Deploy:
- [ ] **CRITICAL**: Rotate Supabase keys (as per security requirement)
- [ ] Update `.env.example` with new key placeholders
- [ ] Test production signup/login flows
- [ ] Monitor user feedback for auth issues

## 🔒 Security Notes

### Key Rotation Required:
After this debugging session, rotate these keys:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Why Rotation Needed:
- Debug logs may have exposed session tokens
- Test users created during debugging
- General security best practice after major auth changes

### How to Rotate:
1. Generate new keys in Supabase dashboard
2. Update `.env.local` with new keys
3. Redeploy application
4. Revoke old keys in Supabase

## 🚀 Performance Impact

### Before Fix:
- Hard redirects caused full page reloads
- Session state inconsistencies
- Multiple network requests during loops
- Poor user experience with page flashing

### After Fix:
- Client-side navigation preserves app state
- Single session establishment
- Reduced network overhead
- Smooth user experience

## 📈 Monitoring

### Metrics to Track:
- Auth completion rate (signup → dashboard)
- Time to complete OTP flow
- Middleware redirect frequency
- Session establishment success rate
- User dropout at OTP step

### Log Patterns to Watch:
- No `REDIRECT_TO_AUTH` followed immediately by `REDIRECT_FROM_AUTH`
- Consistent session state across requests
- Successful profile creation API calls
- Router navigation instead of page reloads

## 🛠️ Rollback Plan

If issues arise after deployment:

### Quick Rollback:
1. Revert to previous commit before merge
2. Emergency hotfix: Add `window.location.reload()` after router.push
3. Monitor for 24 hours

### Alternative Fixes:
1. Increase session delay to 1200ms
2. Add explicit session refresh before redirect
3. Implement retry logic for failed auth flows

## ✅ Acceptance Criteria Met

- [x] Fresh user can signup → verify OTP → complete profile → reach dashboard
- [x] Existing user can login → verify OTP → reach dashboard  
- [x] No redirect loops observed in 5+ test runs
- [x] Dashboard renders without fatal console exceptions
- [x] Middleware logs show session present when dashboard requested
- [x] E2E test passes consistently
- [x] Profile creation API returns canonical server data
- [x] Session persists correctly across navigation

## 📞 Support

If auth issues persist after this fix:

1. Check browser console for `[TEMP]` logs
2. Verify network tab for redirect patterns
3. Test with different browsers/devices
4. Check Supabase dashboard for auth logs
5. Review middleware configuration

**Emergency Contact**: Check with the team if redirect loops reappear or new auth issues emerge.

---

*This runbook documents the complete OTP redirect fix implementation and should serve as reference for future auth debugging.*
