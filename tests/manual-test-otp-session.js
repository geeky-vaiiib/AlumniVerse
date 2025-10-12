/**
 * Manual Test Guide for Supabase OTP/Magic Link Session Restoration
 * 
 * Date: 2025-10-12
 * Issue: After OTP login, user redirected to /auth?redirectTo=/dashboard but session not restored
 * 
 * This guide provides step-by-step manual testing instructions.
 */

console.log('═══════════════════════════════════════════════════════════════')
console.log('🧪 MANUAL TEST GUIDE - Supabase OTP Session Restoration')
console.log('═══════════════════════════════════════════════════════════════')
console.log('')

// ========================================================================
// TEST PREPARATION
// ========================================================================

console.log('📋 STEP 1: CLEAN STATE PREPARATION')
console.log('───────────────────────────────────────────────────────────────')
console.log('1. Open DevTools (F12 / Cmd+Option+I)')
console.log('2. Go to Application tab → Local Storage')
console.log('3. Delete all Supabase keys:')
console.log('   - Look for: sb-flcgwqlabywhoulqalaz-auth-token')
console.log('   - Right-click → Delete')
console.log('')
console.log('4. Alternatively, run in console:')
console.log('   localStorage.clear()')
console.log('')
console.log('5. Clear cookies for localhost:3000')
console.log('6. Close and reopen browser (fresh session)')
console.log('')

// ========================================================================
// TEST EXECUTION
// ========================================================================

console.log('📋 STEP 2: REQUEST OTP')
console.log('───────────────────────────────────────────────────────────────')
console.log('1. Navigate to: http://localhost:3000/auth')
console.log('2. Enter your email address')
console.log('3. Click "Send OTP" or "Sign in with magic link"')
console.log('4. Check your email inbox')
console.log('')

console.log('📋 STEP 3: CLICK MAGIC LINK')
console.log('───────────────────────────────────────────────────────────────')
console.log('1. Open the email from Supabase')
console.log('2. Click the magic link / OTP verification link')
console.log('3. Browser should open and redirect to:')
console.log('   http://localhost:3000/auth?redirectTo=%2Fdashboard')
console.log('   OR with hash fragment:')
console.log('   http://localhost:3000/auth#access_token=...')
console.log('')
console.log('⚠️  IMPORTANT: Copy the EXACT URL from address bar now!')
console.log('   Including any # (hash) fragments')
console.log('')

console.log('📋 STEP 4: VERIFY SESSION IN CONSOLE')
console.log('───────────────────────────────────────────────────────────────')
console.log('Immediately after redirect, run these commands in console:')
console.log('')
console.log('// Command 1: Check session')
console.log('await supabase.auth.getSession().then(r => console.log("Session:", r))')
console.log('')
console.log('// Command 2: Check user')
console.log('await supabase.auth.getUser().then(r => console.log("User:", r))')
console.log('')
console.log('// Command 3: Check localStorage')
console.log('console.log("Storage keys:", Object.keys(localStorage).filter(k=>k.includes("supabase")))')
console.log('console.log("Token:", localStorage.getItem("sb-flcgwqlabywhoulqalaz-auth-token"))')
console.log('')

// ========================================================================
// EXPECTED RESULTS
// ========================================================================

console.log('✅ EXPECTED RESULTS:')
console.log('───────────────────────────────────────────────────────────────')
console.log('1. Session command should show:')
console.log('   {')
console.log('     data: {')
console.log('       session: {')
console.log('         access_token: "eyJ...",')
console.log('         refresh_token: "...",')
console.log('         user: { email: "your@email.com", id: "..." },')
console.log('         expires_at: <timestamp>')
console.log('       }')
console.log('     },')
console.log('     error: null')
console.log('   }')
console.log('')
console.log('2. User command should show:')
console.log('   {')
console.log('     data: {')
console.log('       user: { id: "...", email: "your@email.com", ... }')
console.log('     },')
console.log('     error: null')
console.log('   }')
console.log('')
console.log('3. Storage should contain:')
console.log('   - Key: "sb-flcgwqlabywhoulqalaz-auth-token"')
console.log('   - Value: JSON object with access_token, refresh_token, etc.')
console.log('')
console.log('4. Browser should automatically redirect to:')
console.log('   http://localhost:3000/dashboard')
console.log('   (within 500ms after session detected)')
console.log('')

// ========================================================================
// FAILURE INDICATORS
// ========================================================================

console.log('❌ FAILURE INDICATORS:')
console.log('───────────────────────────────────────────────────────────────')
console.log('If any of these occur, the fix is not working:')
console.log('')
console.log('1. Session command returns:')
console.log('   { data: { session: null }, error: null }')
console.log('')
console.log('2. User command returns:')
console.log('   { data: { user: null }, error: { message: "..." } }')
console.log('')
console.log('3. localStorage is empty or missing auth token')
console.log('')
console.log('4. No automatic redirect to /dashboard')
console.log('')
console.log('5. Console shows errors like:')
console.log('   - "Failed to parse session"')
console.log('   - "No session found"')
console.log('   - CORS errors')
console.log('')

// ========================================================================
// DEBUGGING
// ========================================================================

console.log('🔍 DEBUGGING CHECKLIST:')
console.log('───────────────────────────────────────────────────────────────')
console.log('If test fails, collect this information:')
console.log('')
console.log('1. EXACT redirect URL (copy from address bar)')
console.log('   Include everything after # if present')
console.log('')
console.log('2. Console logs - look for:')
console.log('   [AUTH_HANDLER] messages')
console.log('   [AUTH_PROVIDER] messages')
console.log('   [AUTH_FLOW] messages')
console.log('')
console.log('3. Network tab:')
console.log('   - Check for requests to Supabase')
console.log('   - Look for CORS errors')
console.log('   - Check response headers')
console.log('')
console.log('4. Supabase Dashboard:')
console.log('   - Auth → Settings → Redirect URLs')
console.log('   - Verify these are added:')
console.log('     * http://localhost:3000')
console.log('     * http://localhost:3000/*')
console.log('     * http://localhost:3000/auth')
console.log('')

// ========================================================================
// AUTOMATED CHECK
// ========================================================================

console.log('🤖 AUTOMATED VERIFICATION:')
console.log('───────────────────────────────────────────────────────────────')
console.log('Run this function after clicking magic link:')
console.log('')

window.verifyOTPSession = async function() {
  console.log('\n🔍 Running automated session verification...\n')
  
  const results = {
    urlCheck: false,
    sessionCheck: false,
    userCheck: false,
    storageCheck: false,
    redirectCheck: false
  }

  // Check URL
  const url = window.location.href
  console.log('1. URL Check:', url)
  results.urlCheck = url.includes('#access_token') || url.includes('?access_token')
  console.log(results.urlCheck ? '   ✅ URL contains tokens' : '   ⚠️  URL does not contain tokens')
  
  // Check session
  try {
    const { data: { session }, error } = await window.supabase.auth.getSession()
    results.sessionCheck = !!session && !error
    console.log('2. Session Check:', results.sessionCheck ? '✅ PASS' : '❌ FAIL')
    if (session) {
      console.log('   User:', session.user?.email)
      console.log('   Expires:', new Date(session.expires_at * 1000).toLocaleString())
    } else {
      console.log('   Error:', error?.message || 'No session')
    }
  } catch (err) {
    console.log('2. Session Check: ❌ ERROR -', err.message)
  }
  
  // Check user
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser()
    results.userCheck = !!user && !error
    console.log('3. User Check:', results.userCheck ? '✅ PASS' : '❌ FAIL')
    if (user) {
      console.log('   Email:', user.email)
      console.log('   ID:', user.id)
    }
  } catch (err) {
    console.log('3. User Check: ❌ ERROR -', err.message)
  }
  
  // Check storage
  const storageKey = 'sb-flcgwqlabywhoulqalaz-auth-token'
  const stored = localStorage.getItem(storageKey)
  results.storageCheck = !!stored
  console.log('4. Storage Check:', results.storageCheck ? '✅ PASS' : '❌ FAIL')
  if (stored) {
    try {
      const data = JSON.parse(stored)
      console.log('   Has access_token:', !!data.access_token)
      console.log('   Has refresh_token:', !!data.refresh_token)
    } catch (err) {
      console.log('   ⚠️  Invalid JSON in storage')
    }
  }
  
  // Check redirect
  const isOnAuth = window.location.pathname === '/auth' || window.location.pathname.startsWith('/auth')
  const isDashboard = window.location.pathname === '/dashboard'
  results.redirectCheck = isDashboard || !isOnAuth
  console.log('5. Redirect Check:', results.redirectCheck ? '✅ PASS' : '⏳ PENDING')
  console.log('   Current path:', window.location.pathname)
  console.log('   Expected: /dashboard')
  
  // Summary
  console.log('\n📊 SUMMARY')
  console.log('═══════════════════════════════════════════════════════════════')
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  console.log(`Tests Passed: ${passed}/${total}`)
  console.log('')
  
  if (passed === total) {
    console.log('🎉 ALL CHECKS PASSED!')
    console.log('Session is properly restored and persisted.')
  } else {
    console.log('⚠️  SOME CHECKS FAILED')
    console.log('Review the output above for details.')
  }
  
  return results
}

console.log('To run automated check, execute in console:')
console.log('await verifyOTPSession()')
console.log('')

console.log('═══════════════════════════════════════════════════════════════')
console.log('📝 After testing, document your results in:')
console.log('   FIX_REPORT_OTP_REDIRECT.md')
console.log('═══════════════════════════════════════════════════════════════')
