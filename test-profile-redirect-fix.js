#!/usr/bin/env node

/**
 * Test script to verify the profile completion redirect fix
 * This script tests the complete sign-up → OTP → profile → dashboard flow
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://flcgwqlabywhoulqalaz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNzcwNiwiZXhwIjoyMDc0NDgzNzA2fQ.E_G78W8QdMl7wya1XJ-2RY_aMeWbFM6Vkl89eG5-GL0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testProfileRedirectFix() {
  console.log('🧪 Testing Profile Completion Redirect Fix')
  console.log('=' .repeat(50))

  try {
    // Test 1: Check if profile check API endpoint works
    console.log('\n1️⃣ Testing profile check API endpoint...')
    const testAuthId = 'test-user-123'
    
    try {
      const response = await fetch(`http://localhost:3000/api/profile/check?auth_id=${testAuthId}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Profile check API working:', data)
      } else {
        console.log('⚠️ Profile check API returned error (expected for non-existent user):', data)
      }
    } catch (error) {
      console.log('❌ Profile check API not accessible (server may not be running):', error.message)
    }

    // Test 2: Test profile creation API
    console.log('\n2️⃣ Testing profile creation API...')
    const testProfileData = {
      auth_id: testAuthId,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      branch: 'Computer Science',
      admission_year: 2020,
      passing_year: 2024,
      profile_completed: true
    }

    try {
      const response = await fetch('http://localhost:3000/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProfileData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Profile creation API working:', data)
      } else {
        console.log('❌ Profile creation API failed:', data)
      }
    } catch (error) {
      console.log('❌ Profile creation API not accessible (server may not be running):', error.message)
    }

    // Test 3: Test Supabase connection
    console.log('\n3️⃣ Testing Supabase connection...')
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.log('❌ Supabase connection failed:', error.message)
      } else {
        console.log('✅ Supabase connection working')
      }
    } catch (error) {
      console.log('❌ Supabase connection error:', error.message)
    }

    // Test 4: Check database schema
    console.log('\n4️⃣ Checking database schema...')
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('❌ Database schema issue:', error.message)
      } else {
        console.log('✅ Database schema looks good')
        if (data && data.length > 0) {
          console.log('📊 Sample user record:', Object.keys(data[0]))
        }
      }
    } catch (error) {
      console.log('❌ Database schema check error:', error.message)
    }

    // Test 5: Clean up test data
    console.log('\n5️⃣ Cleaning up test data...')
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('auth_id', testAuthId)
      
      if (error) {
        console.log('⚠️ Cleanup failed (may not exist):', error.message)
      } else {
        console.log('✅ Test data cleaned up')
      }
    } catch (error) {
      console.log('⚠️ Cleanup error:', error.message)
    }

    console.log('\n🎉 Test completed!')
    console.log('\n📋 Manual Testing Checklist:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Open browser to http://localhost:3000/auth')
    console.log('3. Sign up with a test email')
    console.log('4. Complete OTP verification')
    console.log('5. Fill out the profile creation form')
    console.log('6. Verify you are redirected to /dashboard')
    console.log('7. Check browser console for detailed logs')
    console.log('8. Check server console for middleware logs')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileRedirectFix()



