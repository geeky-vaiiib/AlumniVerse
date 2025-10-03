/**
 * Test script to verify profile creation works after schema reset
 * Run this after executing the SQL schema reset
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test data
const testProfile = {
  auth_id: 'test-user-123', // This would normally be auth.uid()
  email: 'test@sit.ac.in',
  first_name: 'Test',
  last_name: 'User',
  usn: '1SI23CS001',
  branch: 'Computer Science',
  admission_year: 2023,
  passing_year: 2027,
  company: 'Test Company',
  current_position: 'Software Engineer',
  location: 'Bangalore, India',
  linkedin_url: 'https://linkedin.com/in/testuser',
  github_url: 'https://github.com/testuser',
  leetcode_url: 'https://leetcode.com/testuser',
  resume_url: null, // Optional field
  bio: 'This is a test bio',
  skills: ['JavaScript', 'React', 'Node.js'],
  profile_completed: true
}

async function testSchemaAndUpsert() {
  console.log('🧪 Testing AlumniVerse profile creation...\n')

  try {
    // Test 1: Check if table exists and has correct structure
    console.log('1. Testing table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (tableError) {
      console.log('❌ Table structure test failed:', tableError.message)
      return
    }
    console.log('✅ Users table exists and is accessible\n')

    // Test 2: Test upsert with valid data
    console.log('2. Testing valid profile upsert...')
    const { data: upsertData, error: upsertError } = await supabase
      .from('users')
      .upsert(testProfile, { onConflict: 'auth_id' })
      .select()

    if (upsertError) {
      console.log('❌ Valid profile upsert failed:', upsertError.message)
      return
    }
    console.log('✅ Valid profile upsert successful')
    console.log('   Inserted/Updated:', upsertData.length, 'record(s)\n')

    // Test 3: Test with invalid GitHub URL (should fail)
    console.log('3. Testing invalid GitHub URL (should fail)...')
    const invalidProfile = { 
      ...testProfile, 
      auth_id: 'test-user-456',
      email: 'test2@sit.ac.in',
      github_url: 'invalid-url' 
    }
    
    const { error: invalidError } = await supabase
      .from('users')
      .upsert(invalidProfile, { onConflict: 'auth_id' })

    if (invalidError) {
      console.log('✅ Invalid GitHub URL correctly rejected:', invalidError.message)
    } else {
      console.log('❌ Invalid GitHub URL was accepted (this is wrong)')
    }

    // Test 4: Test with null URLs (should succeed)
    console.log('\n4. Testing with null URLs...')
    const nullUrlProfile = {
      ...testProfile,
      auth_id: 'test-user-789',
      email: 'test3@sit.ac.in',
      github_url: null,
      linkedin_url: null,
      leetcode_url: null
    }

    const { error: nullError } = await supabase
      .from('users')
      .upsert(nullUrlProfile, { onConflict: 'auth_id' })

    if (nullError) {
      console.log('❌ Null URL profile failed:', nullError.message)
    } else {
      console.log('✅ Null URL profile succeeded')
    }

    // Test 5: Test selecting profiles
    console.log('\n5. Testing profile selection...')
    const { data: selectData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .in('auth_id', ['test-user-123', 'test-user-789'])

    if (selectError) {
      console.log('❌ Profile selection failed:', selectError.message)
    } else {
      console.log('✅ Profile selection successful')
      console.log('   Retrieved:', selectData.length, 'profile(s)')
      selectData.forEach(profile => {
        console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.email})`)
      })
    }

    // Cleanup test data
    console.log('\n6. Cleaning up test data...')
    const { error: cleanupError } = await supabase
      .from('users')
      .delete()
      .in('auth_id', ['test-user-123', 'test-user-456', 'test-user-789'])

    if (cleanupError) {
      console.log('❌ Cleanup failed:', cleanupError.message)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }

    console.log('\n🎉 All tests completed! Your schema is ready for profile creation.')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

// URL validation tests
function testUrlValidation() {
  console.log('\n🔗 Testing URL validation...')
  
  const { validateGitHubUrl, validateLinkedInUrl, validateLeetCodeUrl } = require('./lib/utils/urlValidation')
  
  // Test valid URLs
  const validTests = [
    { fn: validateGitHubUrl, url: 'https://github.com/testuser', expected: true },
    { fn: validateLinkedInUrl, url: 'https://linkedin.com/in/testuser', expected: true },
    { fn: validateLeetCodeUrl, url: 'https://leetcode.com/testuser', expected: true },
  ]
  
  // Test invalid URLs
  const invalidTests = [
    { fn: validateGitHubUrl, url: 'https://gitlab.com/testuser', expected: false },
    { fn: validateGitHubUrl, url: 'invalid-url', expected: false },
    { fn: validateGitHubUrl, url: '', expected: false },
    { fn: validateLinkedInUrl, url: 'https://facebook.com/testuser', expected: false },
    { fn: validateLeetCodeUrl, url: 'https://codechef.com/testuser', expected: false },
  ]
  
  let passed = 0
  let total = validTests.length + invalidTests.length
  
  validTests.forEach(test => {
    const result = test.fn(test.url)
    if ((result !== null) === test.expected) {
      console.log(`✅ ${test.fn.name}("${test.url}") = ${result}`)
      passed++
    } else {
      console.log(`❌ ${test.fn.name}("${test.url}") = ${result} (expected ${test.expected ? 'valid' : 'null'})`)
    }
  })
  
  invalidTests.forEach(test => {
    const result = test.fn(test.url)
    if ((result === null) === test.expected) {
      console.log(`✅ ${test.fn.name}("${test.url}") = ${result}`)
      passed++
    } else {
      console.log(`❌ ${test.fn.name}("${test.url}") = ${result} (expected null)`)
    }
  })
  
  console.log(`\n📊 URL Validation Tests: ${passed}/${total} passed`)
}

// Run tests
if (require.main === module) {
  testUrlValidation()
  testSchemaAndUpsert()
}

module.exports = { testSchemaAndUpsert, testUrlValidation }
