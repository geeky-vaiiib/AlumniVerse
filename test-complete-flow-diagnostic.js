#!/usr/bin/env node

/**
 * Complete Authentication Flow Diagnostic Test
 * Tests the entire signup → profile → dashboard flow
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test data
const testEmail = `test-diagnostic-${Date.now()}@sit.ac.in`
const testPassword = 'TestPassword123!'
const testProfileData = {
  first_name: 'Test',
  last_name: 'User',
  usn: '1SI23CS001',
  branch: 'Computer Science',
  admission_year: 2023,
  passing_year: 2027,
  bio: 'Test user for diagnostic',
  location: 'Bangalore',
  company: 'Test Company',
  current_position: 'Software Engineer',
  skills: ['JavaScript', 'React', 'Node.js'],
  interests: 'Web Development, AI/ML',
  github_url: 'https://github.com/testuser',
  linkedin_url: 'https://linkedin.com/in/testuser'
}

let authUserId = null
let profileId = null

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  
  if (profileId) {
    try {
      await supabaseAdmin.from('users').delete().eq('id', profileId)
      console.log('✅ Test profile deleted')
    } catch (error) {
      console.log('⚠️ Error deleting profile:', error.message)
    }
  }
  
  if (authUserId) {
    try {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      console.log('✅ Test auth user deleted')
    } catch (error) {
      console.log('⚠️ Error deleting auth user:', error.message)
    }
  }
}

async function testSupabaseConnection() {
  console.log('1️⃣ Testing Supabase connection...')
  
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message)
    return false
  }
}

async function testAuthUserCreation() {
  console.log('\n2️⃣ Testing auth user creation...')
  
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (error) throw error
    
    authUserId = data.user.id
    console.log('✅ Auth user created:', authUserId)
    return true
  } catch (error) {
    console.log('❌ Auth user creation failed:', error.message)
    return false
  }
}

async function testProfileCreation() {
  console.log('\n3️⃣ Testing profile creation...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_id: authUserId,
        email: testEmail,
        ...testProfileData
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error}`)
    }
    
    profileId = result.data.id
    console.log('✅ Profile created successfully:', profileId)
    console.log('📊 Profile data:', {
      id: result.data.id,
      auth_id: result.data.auth_id,
      email: result.data.email,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
      profile_completed: result.data.profile_completed
    })
    return true
  } catch (error) {
    console.log('❌ Profile creation failed:', error.message)
    return false
  }
}

async function testProfileCheck() {
  console.log('\n4️⃣ Testing profile check API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/profile/check?auth_id=${authUserId}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error}`)
    }
    
    console.log('✅ Profile check successful')
    console.log('📊 Profile exists:', result.exists)
    console.log('📊 Profile data:', result.data)
    return true
  } catch (error) {
    console.log('❌ Profile check failed:', error.message)
    return false
  }
}

async function testDashboardAccess() {
  console.log('\n5️⃣ Testing dashboard access...')
  
  try {
    // First, get a session for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail
    })
    
    if (sessionError) throw sessionError
    
    console.log('✅ Magic link generated for testing')
    
    // Test dashboard endpoint
    const response = await fetch(`${BASE_URL}/dashboard`)
    console.log('📊 Dashboard response status:', response.status)
    
    if (response.status === 200) {
      console.log('✅ Dashboard accessible')
      return true
    } else {
      console.log('⚠️ Dashboard returned status:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Dashboard access test failed:', error.message)
    return false
  }
}

async function testDatabaseConsistency() {
  console.log('\n6️⃣ Testing database consistency...')
  
  try {
    // Check if profile exists in database
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUserId)
      .single()
    
    if (profileError) throw profileError
    
    if (!profileData) {
      throw new Error('Profile not found in database')
    }
    
    console.log('✅ Profile found in database')
    console.log('📊 Database profile data:', {
      id: profileData.id,
      auth_id: profileData.auth_id,
      email: profileData.email,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      profile_completed: profileData.profile_completed,
      created_at: profileData.created_at
    })
    
    // Verify all required fields are present
    const requiredFields = ['id', 'auth_id', 'email', 'first_name', 'last_name']
    const missingFields = requiredFields.filter(field => !profileData[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
    
    // Check profile_completed field (should be boolean)
    if (typeof profileData.profile_completed !== 'boolean') {
      console.log('⚠️ profile_completed field is not boolean:', typeof profileData.profile_completed)
    }
    
    console.log('✅ All required fields present')
    return true
  } catch (error) {
    console.log('❌ Database consistency check failed:', error.message)
    return false
  }
}

async function runDiagnostic() {
  console.log('🔍 AlumniVerse Complete Flow Diagnostic')
  console.log('=====================================')
  console.log(`📧 Test Email: ${testEmail}`)
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log('')
  
  const results = {
    supabaseConnection: false,
    authUserCreation: false,
    profileCreation: false,
    profileCheck: false,
    dashboardAccess: false,
    databaseConsistency: false
  }
  
  try {
    // Run all tests
    results.supabaseConnection = await testSupabaseConnection()
    results.authUserCreation = await testAuthUserCreation()
    results.profileCreation = await testProfileCreation()
    results.profileCheck = await testProfileCheck()
    results.dashboardAccess = await testDashboardAccess()
    results.databaseConsistency = await testDatabaseConsistency()
    
    // Summary
    console.log('\n📊 DIAGNOSTIC SUMMARY')
    console.log('====================')
    
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`)
    console.log('')
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌'
      const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      console.log(`${status} ${testName}`)
    })
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED - FLOW IS WORKING CORRECTLY!')
    } else {
      console.log('\n⚠️ SOME TESTS FAILED - ISSUES DETECTED')
    }
    
  } catch (error) {
    console.error('\n💥 Diagnostic failed:', error.message)
  } finally {
    await cleanup()
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Diagnostic interrupted, cleaning up...')
  await cleanup()
  process.exit(0)
})

process.on('uncaughtException', async (error) => {
  console.error('\n💥 Uncaught exception:', error.message)
  await cleanup()
  process.exit(1)
})

// Run the diagnostic
runDiagnostic().catch(console.error)
