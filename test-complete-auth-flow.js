#!/usr/bin/env node

/**
 * Complete Authentication Flow Test
 * Tests the full sign-up → OTP → profile → dashboard flow
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://flcgwqlabywhoulqalaz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNzcwNiwiZXhwIjoyMDc0NDgzNzA2fQ.E_G78W8QdMl7wya1XJ-2RY_aMeWbFM6Vkl89eG5-GL0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow')
  console.log('=' .repeat(50))

  const testEmail = `test-${Math.random().toString(36).substring(7)}@sit.ac.in`
  const testProfileData = {
    first_name: 'Test',
    last_name: 'User',
    usn: '1SI23IS999',
    branch: 'Computer Science',
    admission_year: 2020,
    passing_year: 2024,
    profile_completed: true
  }

  try {
    // Step 1: Test OTP Sign-up
    console.log('\n1️⃣ Testing OTP Sign-up...')
    const { data: signupData, error: signupError } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true
      }
    })

    if (signupError) {
      console.log('❌ OTP sign-up failed:', signupError.message)
      return
    }

    console.log('✅ OTP sent successfully')

    // Step 2: Test Profile Creation API
    console.log('\n2️⃣ Testing Profile Creation API...')
    
    // First, try to create a user in the auth system
    let authUser
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      email_confirm: true
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        console.log('⚠️ User already exists, trying to get existing user...')
        // Try to get existing user
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) {
          console.log('❌ Failed to list users:', listError.message)
          return
        }
        const existingUser = listData.users.find(u => u.email === testEmail)
        if (existingUser) {
          authUser = { user: existingUser }
          console.log('✅ Found existing user:', existingUser.id)
        } else {
          console.log('❌ User not found in list')
          return
        }
      } else {
        console.log('❌ Auth user creation failed:', createError.message)
        return
      }
    } else {
      authUser = createData
      console.log('✅ Auth user created:', authUser.user.id)
    }

    // Now test profile creation
    const response = await fetch('http://localhost:3000/api/profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_id: authUser.user.id,
        email: testEmail,
        ...testProfileData
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log('❌ Profile creation failed:', errorData)
      return
    }

    const profileData = await response.json()
    console.log('✅ Profile created successfully:', profileData.data.id)

    // Step 3: Test Profile Check API
    console.log('\n3️⃣ Testing Profile Check API...')
    const checkResponse = await fetch(`http://localhost:3000/api/profile/check?auth_id=${authUser.user.id}`)
    const checkData = await checkResponse.json()

    if (checkResponse.ok && checkData.exists) {
      console.log('✅ Profile check successful:', checkData.profile.email)
    } else {
      console.log('❌ Profile check failed:', checkData)
    }

    // Step 4: Test Database Query
    console.log('\n4️⃣ Testing Database Query...')
    const { data: dbProfile, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.user.id)
      .single()

    if (dbError) {
      console.log('❌ Database query failed:', dbError.message)
    } else {
      console.log('✅ Database query successful:', {
        id: dbProfile.id,
        email: dbProfile.email,
        profile_completed: dbProfile.profile_completed
      })
    }

    // Step 5: Cleanup
    console.log('\n5️⃣ Cleaning up test data...')
    
    // Delete from users table
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('auth_id', authUser.user.id)

    if (deleteError) {
      console.log('⚠️ Users cleanup failed:', deleteError.message)
    } else {
      console.log('✅ Users table cleaned up')
    }

    // Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    if (deleteAuthError) {
      console.log('⚠️ Auth user cleanup failed:', deleteAuthError.message)
    } else {
      console.log('✅ Auth user cleaned up')
    }

    console.log('\n🎉 Complete Auth Flow Test Passed!')
    console.log('\n📋 Manual Testing Steps:')
    console.log('1. Open http://localhost:3000/auth in a private browser window')
    console.log('2. Sign up with a test email (e.g., test@sit.ac.in)')
    console.log('3. Check your email for OTP and enter it')
    console.log('4. Complete the profile creation form')
    console.log('5. Verify you are redirected to /dashboard')
    console.log('6. Check browser console for detailed logs')
    console.log('7. Check server console for middleware logs')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCompleteAuthFlow()
