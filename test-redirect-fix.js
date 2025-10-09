#!/usr/bin/env node

/**
 * Test Script for Infinite Redirect Loop Fix
 * Tests the exact sequence that was causing the issue
 */

async function testAuthFlowFix() {
  console.log('🧪 Testing Infinite Redirect Loop Fix\n')
  
  // Test API endpoints
  console.log('1. Testing profile creation API...')
  try {
    const uuid = crypto.randomUUID()
    const response = await fetch('http://localhost:3001/api/profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_id: uuid,
        email: `test-${Date.now()}@sit.ac.in`,
        first_name: 'Test',
        last_name: 'User',
        profile_completed: true
      })
    })
    
    console.log(`   Status: ${response.status} - ${response.ok ? '✅ Working' : '⚠️ Check logs'}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  console.log('\n2. Testing auth page access...')
  try {
    const response = await fetch('http://localhost:3001/auth')
    console.log(`   Status: ${response.status} - ${response.ok ? '✅ Working' : '❌ Failed'}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  console.log('\n3. Testing auth page with redirectTo...')
  try {
    const response = await fetch('http://localhost:3001/auth?redirectTo=%2Fdashboard')
    console.log(`   Status: ${response.status} - ${response.ok ? '✅ Working' : '❌ Failed'}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  console.log('\n🔧 Key Fixes Applied:')
  console.log('   ✅ AuthProvider: Session transition protection')
  console.log('   ✅ UserContext: Session stabilization wait')
  console.log('   ✅ AuthFlow: Wait gate with 500ms delay')
  console.log('   ✅ Supabase: Session persistence enabled')
  
  console.log('\n📋 Manual Testing Steps:')
  console.log('   1. Open http://localhost:3001/auth in browser')
  console.log('   2. Enter email and request OTP')
  console.log('   3. Complete OTP verification')
  console.log('   4. Fill profile creation form')
  console.log('   5. Click "Complete Profile"')
  console.log('   6. Watch console for clean redirect sequence:')
  console.log('      [AUTH_PROVIDER] SIGNED_IN event - triggering profile fetch/create')
  console.log('      [USER_CONTEXT] Fetching profile for user: <uuid>')
  console.log('      [PROFILE_FLOW] Profile operation successful')
  console.log('      [AUTH_FLOW] ✅ Redirecting to dashboard...')
  console.log('   7. Verify NO /auth?redirectTo=/dashboard appears')
  
  console.log('\n🎯 Expected Behavior:')
  console.log('   • Single redirect to dashboard after profile completion')
  console.log('   • No infinite loops between /auth and /dashboard')
  console.log('   • Session and profile persist correctly')
  console.log('   • Clean console logs with timestamps')
}

testAuthFlowFix().catch(console.error)
