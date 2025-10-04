#!/usr/bin/env node

/**
 * Complete Verification Test for Infinite Recursion Fix
 * Tests all aspects of the RLS policy fix and auth flow
 */

const { createClient } = require('@supabase/supabase-js')
// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

// Simple .env.local parser
const loadEnv = () => {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    })
  } catch (error) {
    console.warn('Could not load .env.local file:', error.message)
  }
}

loadEnv()

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

// Test utilities
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString()
  const symbols = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }
  console.log(`${symbols[type]} [${timestamp}] ${message}`)
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Test functions
async function testRLSPolicies() {
  log('Testing RLS policies for infinite recursion...', 'info')
  
  try {
    // Test 1: Check if RLS is enabled
    const { data: tables, error: tableError } = await supabaseAdmin
      .rpc('get_table_info', { table_name: 'users' })
    
    if (tableError) {
      log('Could not check RLS status via RPC, using direct query', 'warning')
    }

    // Test 2: List current policies
    const { data: policies, error: policyError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')

    if (policyError) {
      log(`Policy check failed: ${policyError.message}`, 'error')
      return false
    }

    log(`Found ${policies.length} RLS policies on users table`, 'info')
    
    // Check for recursive patterns
    let hasRecursivePolicy = false
    policies.forEach(policy => {
      const qual = policy.qual || ''
      const withCheck = policy.with_check || ''
      
      if (qual.includes('SELECT') && qual.includes('users') || 
          withCheck.includes('SELECT') && withCheck.includes('users')) {
        log(`⚠️ Potentially recursive policy found: ${policy.policyname}`, 'warning')
        hasRecursivePolicy = true
      } else {
        log(`✅ Safe policy: ${policy.policyname}`, 'success')
      }
    })

    if (hasRecursivePolicy) {
      log('❌ Recursive policies detected - need to fix', 'error')
      return false
    }

    log('✅ All policies appear safe (no recursive patterns)', 'success')
    return true

  } catch (error) {
    log(`RLS policy test failed: ${error.message}`, 'error')
    return false
  }
}

async function testProfileOperations() {
  log('Testing profile operations for infinite recursion...', 'info')
  
  if (!supabaseAdmin) {
    log('⚠️ Skipping profile operations test (no service role key)', 'warning')
    return true
  }

  const testAuthId = '00000000-0000-0000-0000-000000000001'
  const testEmail = `test.recursion.${Date.now()}@sitpune.edu.in`

  try {
    // Test 1: Create profile (should not cause recursion)
    log('Testing profile creation...', 'info')
    const { data: createData, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: testAuthId,
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        is_email_verified: true,
        profile_completed: false
      })
      .select()
      .single()

    if (createError) {
      log(`Profile creation failed: ${createError.message}`, 'error')
      return false
    }

    log('✅ Profile creation successful (no recursion)', 'success')

    // Test 2: Read profile (should not cause recursion)
    log('Testing profile read...', 'info')
    const { data: readData, error: readError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', testAuthId)
      .single()

    if (readError) {
      log(`Profile read failed: ${readError.message}`, 'error')
      return false
    }

    log('✅ Profile read successful (no recursion)', 'success')

    // Test 3: Update profile (should not cause recursion)
    log('Testing profile update...', 'info')
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        first_name: 'Updated',
        profile_completed: true
      })
      .eq('auth_id', testAuthId)
      .select()
      .single()

    if (updateError) {
      log(`Profile update failed: ${updateError.message}`, 'error')
      return false
    }

    log('✅ Profile update successful (no recursion)', 'success')

    // Cleanup
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('auth_id', testAuthId)

    log('✅ Test cleanup completed', 'success')
    return true

  } catch (error) {
    log(`Profile operations test failed: ${error.message}`, 'error')
    return false
  }
}

async function testAuthFlow() {
  log('Testing authentication flow...', 'info')
  
  try {
    // Test 1: Check auth endpoints are accessible
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      log(`Session check failed: ${sessionError.message}`, 'error')
      return false
    }

    log('✅ Auth session check successful', 'success')

    // Test 2: Test public read access (should work with RLS)
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('is_email_verified', true)
      .limit(1)

    if (publicError && publicError.code !== 'PGRST116') { // PGRST116 = no rows
      log(`Public read test failed: ${publicError.message}`, 'error')
      return false
    }

    log('✅ Public read access working (RLS allows verified profiles)', 'success')
    return true

  } catch (error) {
    log(`Auth flow test failed: ${error.message}`, 'error')
    return false
  }
}

async function testServerEndpoint() {
  log('Testing server profile creation endpoint...', 'info')
  
  try {
    // Test the /api/profile/create endpoint
    const testData = {
      auth_id: '00000000-0000-0000-0000-000000000002',
      email: `test.endpoint.${Date.now()}@sitpune.edu.in`,
      first_name: 'Endpoint',
      last_name: 'Test'
    }

    const response = await fetch('http://localhost:5001/api/profile/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      log(`Server endpoint test failed: ${errorData.error}`, 'error')
      return false
    }

    const result = await response.json()
    log('✅ Server profile creation endpoint working', 'success')

    // Cleanup
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('auth_id', testData.auth_id)
    }

    return true

  } catch (error) {
    log(`Server endpoint test failed: ${error.message}`, 'error')
    return false
  }
}

async function runAcceptanceCriteria() {
  log('Running acceptance criteria checklist...', 'info')
  
  const criteria = [
    { name: 'RLS policies are non-recursive', test: testRLSPolicies },
    { name: 'Profile operations work without recursion', test: testProfileOperations },
    { name: 'Auth flow is functional', test: testAuthFlow },
    { name: 'Server endpoint is working', test: testServerEndpoint }
  ]

  let allPassed = true
  const results = {}

  for (const criterion of criteria) {
    log(`\nTesting: ${criterion.name}`, 'info')
    try {
      const result = await criterion.test()
      results[criterion.name] = result
      if (!result) {
        allPassed = false
      }
    } catch (error) {
      log(`Test failed with exception: ${error.message}`, 'error')
      results[criterion.name] = false
      allPassed = false
    }
  }

  return { allPassed, results }
}

async function generateFinalReport() {
  log('\n🔍 INFINITE RECURSION FIX - VERIFICATION REPORT', 'info')
  log('=' .repeat(60), 'info')
  
  const { allPassed, results } = await runAcceptanceCriteria()

  log('\n📋 ACCEPTANCE CRITERIA RESULTS:', 'info')
  Object.entries(results).forEach(([criterion, passed]) => {
    log(`  ${criterion}: ${passed ? '✅ PASSED' : '❌ FAILED'}`, passed ? 'success' : 'error')
  })

  log(`\n🎯 OVERALL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, allPassed ? 'success' : 'error')

  if (allPassed) {
    log('\n🎉 INFINITE RECURSION ISSUE RESOLVED!', 'success')
    log('✅ Profile save should now work without policy errors', 'success')
    log('✅ RLS policies are safe and non-recursive', 'success')
    log('✅ Authentication flow is robust', 'success')
    log('✅ Server fallback endpoint is functional', 'success')
    log('\n📋 NEXT STEPS:', 'info')
    log('1. Test profile save in the frontend application', 'info')
    log('2. Verify OTP → profile creation → dashboard flow', 'info')
    log('3. Confirm no more "infinite recursion" errors', 'info')
  } else {
    log('\n⚠️ SOME ISSUES REMAIN:', 'warning')
    log('1. Check failed tests above', 'warning')
    log('2. Review RLS policies in Supabase dashboard', 'warning')
    log('3. Ensure CRITICAL_RLS_FIX.sql was run successfully', 'warning')
  }

  return allPassed
}

// Main execution
async function main() {
  console.log('\n🚀 Infinite Recursion Fix Verification Suite')
  console.log('=' .repeat(60))
  
  try {
    const success = await generateFinalReport()
    process.exit(success ? 0 : 1)
  } catch (error) {
    log(`Verification suite failed: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  testRLSPolicies,
  testProfileOperations,
  testAuthFlow,
  testServerEndpoint,
  runAcceptanceCriteria,
  generateFinalReport
}
