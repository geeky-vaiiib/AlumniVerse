#!/usr/bin/env node
/**
 * Test script to reproduce and verify the OTP redirect issue
 * Run with: node test-otp-redirect-issue.js
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const TEST_EMAIL = 'test.otp.user@sit.ac.in'
const BASE_URL = 'http://localhost:3000'

// Utility functions
const logStep = (step) => console.log(`\n🔄 ${step}`)
const logSuccess = (msg) => console.log(`✅ ${msg}`)
const logError = (msg) => console.log(`❌ ${msg}`)
const logWarning = (msg) => console.log(`⚠️  ${msg}`)

// Clean up test user before starting
async function cleanupTestUser() {
  logStep('Cleaning up existing test user...')
  
  try {
    // Delete from users table
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', TEST_EMAIL)
    
    if (deleteError) {
      logWarning(`Failed to cleanup users table: ${deleteError.message}`)
    }
    
    logSuccess('Test user cleanup completed')
  } catch (error) {
    logWarning(`Cleanup error: ${error.message}`)
  }
}

// Test the signup flow
async function testSignupFlow() {
  logStep('Testing signup flow...')
  
  const signupData = {
    email: TEST_EMAIL,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'OTPUser',
        usn: '1SI20CS117',
        branch: 'Computer Science',
        joining_year: 2020,
        passing_year: 2024
      }
    }
  }
  
  const { data, error } = await supabase.auth.signInWithOtp(signupData)
  
  if (error) {
    logError(`Signup failed: ${error.message}`)
    return false
  }
  
  logSuccess('OTP sent successfully')
  return true
}

// Test OTP verification with a test code
async function testOTPVerification() {
  logStep('Testing OTP verification...')
  
  // For testing, we'll use a bypass method since we don't have actual OTP
  // In real testing, you'd enter the OTP received via email
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: TEST_EMAIL,
      token: '123456', // This might fail but let's see the behavior
      type: 'email'
    })
    
    if (error) {
      logWarning(`OTP verification failed (expected): ${error.message}`)
      // This is expected since we're using a dummy OTP
      return false
    }
    
    logSuccess('OTP verification succeeded')
    return data
  } catch (error) {
    logWarning(`OTP verification error: ${error.message}`)
    return false
  }
}

// Test session state after verification
async function testSessionState() {
  logStep('Testing session state...')
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    logError(`Session check failed: ${error.message}`)
    return null
  }
  
  if (session) {
    logSuccess(`Session found: ${session.user.email}`)
    return session
  } else {
    logWarning('No session found')
    return null
  }
}

// Test profile creation API
async function testProfileCreationAPI(session) {
  logStep('Testing profile creation API...')
  
  if (!session) {
    logError('No session available for profile creation')
    return false
  }
  
  const profileData = {
    auth_id: session.user.id,
    email: session.user.email,
    first_name: 'Test',
    last_name: 'OTPUser',
    usn: '1SI20CS117',
    branch: 'Computer Science',
    admission_year: 2020,
    passing_year: 2024
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(profileData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      logError(`Profile creation failed: ${result.error}`)
      return false
    }
    
    logSuccess('Profile created successfully via API')
    return result.data
  } catch (error) {
    logError(`Profile creation API error: ${error.message}`)
    return false
  }
}

// Test middleware behavior
async function testMiddlewareBehavior(session) {
  logStep('Testing middleware behavior...')
  
  const testRoutes = ['/dashboard', '/profile', '/auth']
  
  for (const route of testRoutes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        headers: session ? {
          'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
        } : {},
        redirect: 'manual'
      })
      
      console.log(`   ${route}: ${response.status} ${response.statusText}`)
      
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        console.log(`   → Redirects to: ${location}`)
      }
    } catch (error) {
      logError(`Error testing ${route}: ${error.message}`)
    }
  }
}

// Main test function
async function runTests() {
  console.log('🧪 OTP Redirect Issue - Diagnostic Test')
  console.log('=====================================')
  
  try {
    // Phase A: Reproduce the problem
    await cleanupTestUser()
    
    const signupSuccess = await testSignupFlow()
    if (!signupSuccess) {
      logError('Signup flow failed, cannot continue')
      return
    }
    
    // Note: In real testing, you would manually enter the OTP here
    logWarning('MANUAL STEP REQUIRED: Check your email and note the OTP')
    logWarning('For automated testing, we\'ll simulate the verification step')
    
    // Simulate successful OTP verification (you'd replace this with actual OTP)
    // const verificationData = await testOTPVerification()
    
    // Test session state
    const session = await testSessionState()
    
    // Test profile creation
    if (session) {
      await testProfileCreationAPI(session)
    }
    
    // Test middleware behavior
    await testMiddlewareBehavior(session)
    
    console.log('\n📋 SUMMARY:')
    console.log('- Manual OTP verification step required')
    console.log('- Check browser console for auth state changes')
    console.log('- Monitor network tab for redirect loops')
    console.log('- Verify middleware logs in server console')
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`)
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}

export { runTests }
