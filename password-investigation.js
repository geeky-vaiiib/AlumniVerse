#!/usr/bin/env node
/**
 * Password Authentication Investigation
 * Checks if OTP-only users can use password login
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://flcgwqlabywhoulqalaz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const TEST_EMAIL = 'password.test@sit.ac.in'
const TEST_PASSWORD = 'TestPassword123!'

async function testPasswordSignup() {
  console.log('🔧 Testing signup with password...')
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          first_name: 'Password',
          last_name: 'Test'
        }
      }
    })
    
    if (error) {
      console.error('❌ Password signup failed:', error.message)
      return false
    }
    
    console.log('✅ Password signup successful')
    console.log('📧 Check email for confirmation link')
    return data
  } catch (err) {
    console.error('❌ Password signup exception:', err.message)
    return false
  }
}

async function testPasswordLogin() {
  console.log('🔧 Testing password login...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
    
    if (error) {
      console.error('❌ Password login failed:', error.message)
      console.log('Error code:', error.code)
      console.log('Error details:', JSON.stringify(error, null, 2))
      return false
    }
    
    console.log('✅ Password login successful')
    return data
  } catch (err) {
    console.error('❌ Password login exception:', err.message)
    return false
  }
}

async function testOTPUserPasswordLogin() {
  console.log('🔧 Testing password login for OTP-only user...')
  
  const OTP_USER_EMAIL = 'debug.test@sit.ac.in' // User created via OTP
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: OTP_USER_EMAIL,
      password: 'AnyPassword123!' // This should fail
    })
    
    if (error) {
      console.log('✅ Expected: Password login failed for OTP-only user')
      console.log('Error:', error.message)
      console.log('Code:', error.code)
      return false
    }
    
    console.log('❌ Unexpected: Password login succeeded for OTP-only user')
    return data
  } catch (err) {
    console.error('❌ Password login exception:', err.message)
    return false
  }
}

async function runPasswordTests() {
  console.log('🔍 PASSWORD AUTHENTICATION INVESTIGATION')
  console.log('=' .repeat(50))
  
  console.log('\n1. Testing password signup (new user)')
  await testPasswordSignup()
  
  console.log('\n2. Testing password login (should work for password users)')
  await testPasswordLogin()
  
  console.log('\n3. Testing password login for OTP-only user (should fail)')
  await testOTPUserPasswordLogin()
  
  console.log('\n📋 ANALYSIS:')
  console.log('- OTP-only users cannot use password login (expected)')
  console.log('- Users must set a password to use password authentication')
  console.log('- Consider adding "Set Password" functionality for OTP users')
  console.log('- Or make it clear that some users are OTP-only')
}

runPasswordTests().catch(console.error)
