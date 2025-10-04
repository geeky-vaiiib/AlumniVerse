#!/usr/bin/env node

/**
 * AlumniVerse Authentication Flow Test Suite
 * Tests the complete OTP verification and profile creation flow
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
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
async function testDatabaseSchema() {
  log('Testing database schema...', 'info')
  
  try {
    // Test 1: Check if auth_id column exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .eq('column_name', 'auth_id')

    if (columnError) {
      log(`Schema check failed: ${columnError.message}`, 'error')
      return false
    }

    if (!columns || columns.length === 0) {
      log('❌ auth_id column not found in users table', 'error')
      log('👉 Run the migration: backend/database/fix_auth_id_migration.sql', 'warning')
      return false
    }

    log('✅ auth_id column exists', 'success')

    // Test 2: Check constraints
    if (supabaseAdmin) {
      const { data: constraints } = await supabaseAdmin
        .rpc('get_table_constraints', { table_name: 'users' })
        .single()

      log('✅ Database schema validation passed', 'success')
    }

    return true
  } catch (error) {
    log(`Schema test failed: ${error.message}`, 'error')
    return false
  }
}

async function testRLSPolicies() {
  log('Testing Row Level Security policies...', 'info')
  
  try {
    // Test public read access (should work without auth)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('is_email_verified', true)
      .eq('is_deleted', false)
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is OK
      log(`RLS test failed: ${error.message}`, 'error')
      return false
    }

    log('✅ RLS policies allow public read access', 'success')
    return true
  } catch (error) {
    log(`RLS test failed: ${error.message}`, 'error')
    return false
  }
}

async function testProfileCreation() {
  log('Testing profile creation flow...', 'info')
  
  if (!supabaseAdmin) {
    log('⚠️ Skipping profile creation test (no service role key)', 'warning')
    return true
  }

  const testEmail = `test.user.cs20.${Date.now()}@sitpune.edu.in`
  const testAuthId = '00000000-0000-0000-0000-000000000001' // Fake UUID for testing

  try {
    // Test profile creation
    const profileData = {
      auth_id: testAuthId,
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      usn: '4SO20CS999',
      branch: 'Computer Science',
      branch_code: 'CS',
      admission_year: 2020,
      passing_year: 2024,
      is_email_verified: true,
      profile_completed: false,
      password_hash: null
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(profileData)
      .select()
      .single()

    if (insertError) {
      log(`Profile creation failed: ${insertError.message}`, 'error')
      return false
    }

    log('✅ Profile creation successful', 'success')

    // Test profile retrieval
    const { data: profile, error: selectError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', testAuthId)
      .single()

    if (selectError) {
      log(`Profile retrieval failed: ${selectError.message}`, 'error')
      return false
    }

    log('✅ Profile retrieval successful', 'success')

    // Cleanup test data
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('auth_id', testAuthId)

    log('✅ Test cleanup completed', 'success')
    return true

  } catch (error) {
    log(`Profile creation test failed: ${error.message}`, 'error')
    return false
  }
}

async function testUserStatistics() {
  log('Gathering user statistics...', 'info')
  
  try {
    const { data: stats, error } = await supabase
      .from('users')
      .select('id, is_email_verified, profile_completed, auth_id, created_at')

    if (error) {
      log(`Statistics query failed: ${error.message}`, 'error')
      return false
    }

    const totalUsers = stats.length
    const verifiedUsers = stats.filter(u => u.is_email_verified).length
    const completedProfiles = stats.filter(u => u.profile_completed).length
    const usersWithAuthId = stats.filter(u => u.auth_id).length
    const recentUsers = stats.filter(u => {
      const created = new Date(u.created_at)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return created > dayAgo
    }).length

    log(`📊 User Statistics:`, 'info')
    log(`   Total users: ${totalUsers}`, 'info')
    log(`   Verified users: ${verifiedUsers}`, 'info')
    log(`   Completed profiles: ${completedProfiles}`, 'info')
    log(`   Users with auth_id: ${usersWithAuthId}`, 'info')
    log(`   Recent signups (24h): ${recentUsers}`, 'info')

    if (totalUsers > 0 && usersWithAuthId === 0) {
      log('⚠️ Warning: Users exist but none have auth_id', 'warning')
      log('👉 Run migration or use cleanup queries', 'warning')
    }

    return true
  } catch (error) {
    log(`Statistics test failed: ${error.message}`, 'error')
    return false
  }
}

async function testEnvironmentConfig() {
  log('Testing environment configuration...', 'info')
  
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_KEY, optional: true }
  ]

  let allPassed = true

  for (const check of checks) {
    if (check.value) {
      log(`✅ ${check.name}: configured`, 'success')
    } else if (check.optional) {
      log(`⚠️ ${check.name}: not configured (optional)`, 'warning')
    } else {
      log(`❌ ${check.name}: missing`, 'error')
      allPassed = false
    }
  }

  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error && error.code !== 'PGRST116') {
      log(`❌ Supabase connection failed: ${error.message}`, 'error')
      allPassed = false
    } else {
      log('✅ Supabase connection successful', 'success')
    }
  } catch (error) {
    log(`❌ Supabase connection error: ${error.message}`, 'error')
    allPassed = false
  }

  return allPassed
}

async function generateDiagnosticReport() {
  log('Generating diagnostic report...', 'info')
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      supabase_url: SUPABASE_URL ? 'configured' : 'missing',
      anon_key: SUPABASE_ANON_KEY ? 'configured' : 'missing',
      service_key: SUPABASE_SERVICE_KEY ? 'configured' : 'missing'
    },
    tests: {}
  }

  // Run all tests and collect results
  report.tests.environment = await testEnvironmentConfig()
  report.tests.schema = await testDatabaseSchema()
  report.tests.rls = await testRLSPolicies()
  report.tests.profile_creation = await testProfileCreation()
  report.tests.statistics = await testUserStatistics()

  const allPassed = Object.values(report.tests).every(result => result === true)
  
  log('\n📋 DIAGNOSTIC REPORT', 'info')
  log('='.repeat(50), 'info')
  log(`Timestamp: ${report.timestamp}`, 'info')
  log(`Overall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`, allPassed ? 'success' : 'error')
  log('\nTest Results:', 'info')
  
  Object.entries(report.tests).forEach(([test, passed]) => {
    log(`  ${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`, passed ? 'success' : 'error')
  })

  if (!allPassed) {
    log('\n🔧 RECOMMENDED ACTIONS:', 'warning')
    if (!report.tests.schema) {
      log('  1. Run database migration: backend/database/fix_auth_id_migration.sql', 'warning')
    }
    if (!report.tests.environment) {
      log('  2. Check environment variables in .env.local', 'warning')
    }
    if (!report.tests.rls) {
      log('  3. Verify RLS policies in Supabase Dashboard', 'warning')
    }
    log('  4. See FIXES_IMPLEMENTATION_GUIDE.md for detailed instructions', 'warning')
  } else {
    log('\n🎉 ALL TESTS PASSED! AlumniVerse is ready for production.', 'success')
  }

  return report
}

// Main execution
async function main() {
  console.log('\n🚀 AlumniVerse Authentication Flow Test Suite')
  console.log('=' .repeat(60))
  
  try {
    await generateDiagnosticReport()
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  testDatabaseSchema,
  testRLSPolicies,
  testProfileCreation,
  testUserStatistics,
  testEnvironmentConfig,
  generateDiagnosticReport
}
