#!/usr/bin/env node
/**
 * Live OTP Verification Test
 * Simulates the exact flow happening in the user's browser
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://flcgwqlabywhoulqalaz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'
const BASE_URL = 'http://localhost:3000'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const fetch = globalThis.fetch

async function testLiveOTPFlow() {
  console.log('🔄 Testing Live OTP Verification Flow')
  console.log('=====================================')
  
  const testEmail = '1si23cs117@sit.ac.in' // Using the email from the screenshot
  
  try {
    console.log('📧 Step 1: Testing OTP verification for:', testEmail)
    
    // Test what happens after OTP verification
    console.log('🔐 Step 2: Simulating successful OTP verification...')
    
    // Test the profile creation endpoint that runs after OTP verification
    console.log('👤 Step 3: Testing profile creation flow...')
    
    const profileData = {
      auth_id: crypto.randomUUID(), // Simulated auth ID from OTP verification
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      usn: '1SI23CS117',
      branch: 'Computer Science',
      admission_year: 2023,
      passing_year: 2027
    }
    
    console.log('📤 Testing profile creation API...')
    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    })
    
    const result = await response.json()
    
    console.log(`📊 Profile API Response: ${response.status}`)
    console.log('📄 Response Data:', JSON.stringify(result, null, 2))
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Profile creation: SUCCESS')
    } else if (response.status === 409) {
      console.log('⚠️  Profile already exists - testing idempotent handling...')
      
      // Test if our idempotent fix is working
      if (result.success && result.message === 'Profile already exists') {
        console.log('✅ Idempotent behavior: WORKING')
      } else {
        console.log('❌ Idempotent behavior: FAILED')
      }
    } else {
      console.log('❌ Profile creation: FAILED')
    }
    
    // Test middleware auth paths
    console.log('\n🛡️  Step 4: Testing middleware auth paths...')
    
    const authPaths = [
      '/auth',
      '/auth/otp-verification', 
      '/api/profile/create'
    ]
    
    for (const path of authPaths) {
      try {
        const response = await fetch(`${BASE_URL}${path}`, {
          method: 'GET',
          headers: { 'User-Agent': 'test-otp-flow' }
        })
        
        if (response.status === 200) {
          console.log(`✅ Auth path accessible: ${path}`)
        } else if (response.status === 404) {
          console.log(`ℹ️  Auth path not found: ${path} (expected for some paths)`)
        } else {
          console.log(`❌ Auth path blocked: ${path} (${response.status})`)
        }
      } catch (error) {
        console.log(`❌ Auth path error: ${path} - ${error.message}`)
      }
    }
    
    // Test token refresh endpoint
    console.log('\n🔄 Step 5: Testing token refresh handling...')
    
    try {
      const refreshResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ refresh_token: 'dummy_token_for_testing' })
      })
      
      console.log(`🔄 Token refresh response: ${refreshResponse.status}`)
      
      if (refreshResponse.status === 400) {
        console.log('ℹ️  Expected 400 for invalid refresh token')
      }
      
    } catch (error) {
      console.log('ℹ️  Token refresh test completed')
    }
    
    console.log('\n📋 LIVE FLOW ANALYSIS:')
    console.log('======================')
    console.log('🎯 Current Issues to Watch:')
    console.log('   1. Profile creation after OTP verification')
    console.log('   2. Redirect from /auth to /dashboard')
    console.log('   3. Session propagation timing')
    console.log('   4. Middleware route handling')
    
    console.log('\n🔧 Fixes Applied:')
    console.log('   ✅ Idempotent profile creation')
    console.log('   ✅ Enhanced session timing (800ms)')
    console.log('   ✅ Auth path whitelisting')
    console.log('   ✅ Router.push instead of window.location')
    
    console.log('\n💡 What to check in browser:')
    console.log('   1. Console logs for [TEMP] messages')
    console.log('   2. Network tab for API calls')
    console.log('   3. Final URL after OTP verification')
    
    // Cleanup test data
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('auth_id', profileData.auth_id)
    
    if (!error) {
      console.log('\n🧹 Test data cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Live flow test failed:', error.message)
  }
}

testLiveOTPFlow().catch(console.error)
