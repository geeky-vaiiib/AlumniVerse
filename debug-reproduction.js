#!/usr/bin/env node
/**
 * OTP Redirect Issue Reproduction Script
 * This script reproduces the exact issues described and captures logs
 */

import { createClient } from '@supabase/supabase-js'

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch

// Environment setup
const SUPABASE_URL = 'https://flcgwqlabywhoulqalaz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'
const BASE_URL = 'http://localhost:3002'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test email
const TEST_EMAIL = 'debug.test@sit.ac.in'

// Utility functions
const logStep = (step) => console.log(`\n🔄 STEP: ${step}`)
const logSuccess = (msg) => console.log(`✅ ${msg}`)
const logError = (msg) => console.log(`❌ ${msg}`)
const logInfo = (msg) => console.log(`ℹ️  ${msg}`)

async function testPasswordLogin() {
  logStep('Testing Password Login (Hypothesis B)')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: 'TestPassword123'
    })
    
    if (error) {
      logError(`Password login failed: ${error.message}`)
      logInfo(`Error details: ${JSON.stringify(error, null, 2)}`)
      return false
    }
    
    logSuccess('Password login successful')
    return data
  } catch (err) {
    logError(`Password login exception: ${err.message}`)
    return false
  }
}

async function testOTPSignup() {
  logStep('Testing OTP Signup')
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: TEST_EMAIL,
      options: {
        data: {
          first_name: 'Debug',
          last_name: 'Test',
          usn: '1SI20CS999',
          branch: 'Computer Science',
          joining_year: 2020,
          passing_year: 2024
        }
      }
    })
    
    if (error) {
      logError(`OTP signup failed: ${error.message}`)
      return false
    }
    
    logSuccess('OTP sent successfully')
    logInfo('Check email for OTP code')
    return data
  } catch (err) {
    logError(`OTP signup exception: ${err.message}`)
    return false
  }
}

async function testOTPVerification(otpCode) {
  logStep('Testing OTP Verification')
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: TEST_EMAIL,
      token: otpCode,
      type: 'email'
    })
    
    if (error) {
      logError(`OTP verification failed: ${error.message}`)
      logInfo(`Error details: ${JSON.stringify(error, null, 2)}`)
      return false
    }
    
    logSuccess('OTP verification successful')
    logInfo(`User ID: ${data?.user?.id}`)
    logInfo(`Session: ${!!data?.session}`)
    return data
  } catch (err) {
    logError(`OTP verification exception: ${err.message}`)
    return false
  }
}

async function testProfileCreation(authId, email) {
  logStep('Testing Profile Creation API (Hypothesis A)')
  
  const profileData = {
    auth_id: authId,
    email: email,
    first_name: 'Debug',
    last_name: 'Test',
    usn: '1SI20CS999',
    branch: 'Computer Science',
    admission_year: 2020,
    passing_year: 2024
  }
  
  try {
    logInfo(`Making request to: ${BASE_URL}/api/profile/create`)
    logInfo(`Request body: ${JSON.stringify(profileData, null, 2)}`)
    
    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    })
    
    const responseText = await response.text()
    let responseData
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { rawResponse: responseText }
    }
    
    logInfo(`Response status: ${response.status}`)
    logInfo(`Response body: ${JSON.stringify(responseData, null, 2)}`)
    
    if (response.status === 409) {
      logError('Profile creation returned 409 Conflict - this blocks the flow!')
      return { conflict: true, data: responseData }
    }
    
    if (!response.ok) {
      logError(`Profile creation failed with status ${response.status}`)
      return false
    }
    
    logSuccess('Profile creation successful')
    return responseData
  } catch (err) {
    logError(`Profile creation exception: ${err.message}`)
    return false
  }
}

async function testTokenRefresh() {
  logStep('Testing Token Refresh (Hypothesis C)')
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (!session) {
      logInfo('No session found for refresh test')
      return false
    }
    
    logInfo(`Current session expires at: ${new Date(session.expires_at * 1000)}`)
    
    const { data, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      logError(`Token refresh failed: ${refreshError.message}`)
      logInfo(`Error details: ${JSON.stringify(refreshError, null, 2)}`)
      return false
    }
    
    logSuccess('Token refresh successful')
    return data
  } catch (err) {
    logError(`Token refresh exception: ${err.message}`)
    return false
  }
}

async function checkExistingProfile(authId) {
  logStep(`Checking for existing profile with auth_id: ${authId}`)
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
    
    if (error) {
      logError(`Profile check failed: ${error.message}`)
      return false
    }
    
    if (data && data.length > 0) {
      logInfo(`Found ${data.length} existing profile(s)`)
      logInfo(`Profile data: ${JSON.stringify(data[0], null, 2)}`)
      return data
    } else {
      logInfo('No existing profile found')
      return null
    }
  } catch (err) {
    logError(`Profile check exception: ${err.message}`)
    return false
  }
}

async function testMiddleware() {
  logStep('Testing Middleware Behavior (Hypothesis D)')
  
  const testPaths = ['/dashboard', '/auth', '/api/profile/create']
  
  for (const path of testPaths) {
    try {
      logInfo(`Testing middleware for path: ${path}`)
      
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        redirect: 'manual'
      })
      
      logInfo(`${path}: Status ${response.status}`)
      
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        logInfo(`${path}: Redirects to ${location}`)
      }
    } catch (err) {
      logError(`Middleware test failed for ${path}: ${err.message}`)
    }
  }
}

async function runDiagnosis() {
  console.log('🔍 OTP REDIRECT ISSUE - ROOT CAUSE DIAGNOSIS')
  console.log('=' .repeat(50))
  
  logInfo(`Base URL: ${BASE_URL}`)
  logInfo(`Test Email: ${TEST_EMAIL}`)
  
  // Test 1: Check for existing profile conflicts
  await testOTPSignup()
  
  // Test 2: Password login (for 400 error)
  await testPasswordLogin()
  
  // Test 3: Middleware behavior
  await testMiddleware()
  
  // Test 4: Token refresh
  await testTokenRefresh()
  
  console.log('\n📋 DIAGNOSIS SUMMARY:')
  console.log('- Check logs above for specific failure points')
  console.log('- Profile creation 409 conflicts need idempotent handling')
  console.log('- Password login 400 errors need investigation')
  console.log('- Middleware redirect patterns need analysis')
  
  console.log('\n📧 Manual step required:')
  console.log('1. Check email for OTP code')
  console.log('2. Run: testOTPVerification("123456") with actual code')
  console.log('3. Then check profile creation conflicts')
}

// Export functions for manual testing
global.testOTPVerification = testOTPVerification
global.testProfileCreation = testProfileCreation
global.checkExistingProfile = checkExistingProfile

// Run diagnosis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnosis().catch(console.error)
}

export {
  testOTPSignup,
  testOTPVerification,
  testProfileCreation,
  testPasswordLogin,
  testTokenRefresh,
  checkExistingProfile,
  testMiddleware
}
