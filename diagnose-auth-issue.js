#!/usr/bin/env node
/**
 * Comprehensive Auth Issue Diagnostic Tool
 * This script checks Supabase Auth and database state to diagnose the auth issue
 */

const fs = require('fs')
const path = require('path')

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      process.env[key] = value
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function diagnoseAuthIssue() {
  console.log('🔍 AlumniVerse Authentication Diagnostic Tool\n')
  console.log('=' .repeat(70))
  
  try {
    // 1. Check Supabase Auth Users
    console.log('\n📋 STEP 1: Checking Supabase Auth Users')
    console.log('-'.repeat(70))
    
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Failed to fetch auth users:', authError.message)
    } else {
      console.log(`✅ Found ${authUsers.length} users in Supabase Auth`)
      
      if (authUsers.length > 0) {
        console.log('\nAuth Users Details:')
        authUsers.forEach((user, idx) => {
          console.log(`\n  User ${idx + 1}:`)
          console.log(`    - ID: ${user.id}`)
          console.log(`    - Email: ${user.email}`)
          console.log(`    - Email Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`)
          console.log(`    - Created: ${new Date(user.created_at).toLocaleString()}`)
          console.log(`    - Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)
          console.log(`    - Phone: ${user.phone || 'N/A'}`)
          console.log(`    - User Metadata:`, JSON.stringify(user.user_metadata, null, 2))
        })
      } else {
        console.log('⚠️  No users found in Supabase Auth')
      }
    }
    
    // 2. Check Database Users Table
    console.log('\n\n📋 STEP 2: Checking Database Users Table')
    console.log('-'.repeat(70))
    
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (dbError) {
      console.error('❌ Failed to fetch database users:', dbError.message)
      console.error('   Error Code:', dbError.code)
      console.error('   Error Details:', dbError.details)
      
      // Check if table exists
      console.log('\n⚠️  Attempting to verify table structure...')
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
      
      if (tableError) {
        console.error('❌ Cannot verify table structure:', tableError.message)
      } else if (!tables || tables.length === 0) {
        console.error('❌ Users table does not exist!')
      } else {
        console.log('✅ Users table exists')
      }
    } else {
      console.log(`✅ Found ${dbUsers.length} users in database`)
      
      if (dbUsers.length > 0) {
        console.log('\nDatabase Users Details:')
        dbUsers.forEach((user, idx) => {
          console.log(`\n  User ${idx + 1}:`)
          console.log(`    - ID: ${user.id}`)
          console.log(`    - Auth ID: ${user.auth_id || 'N/A'}`)
          console.log(`    - Name: ${user.first_name} ${user.last_name}`)
          console.log(`    - Email: ${user.email}`)
          console.log(`    - USN: ${user.usn || 'N/A'}`)
          console.log(`    - Branch: ${user.branch || 'N/A'}`)
          console.log(`    - Email Verified: ${user.is_email_verified ? '✅ Yes' : '❌ No'}`)
          console.log(`    - Profile Complete: ${user.is_profile_complete ? '✅ Yes' : '❌ No'}`)
          console.log(`    - Created: ${new Date(user.created_at).toLocaleString()}`)
        })
      } else {
        console.log('⚠️  No users found in database')
      }
    }
    
    // 3. Check for Mismatches
    console.log('\n\n📋 STEP 3: Checking for Auth/Database Mismatches')
    console.log('-'.repeat(70))
    
    if (!authError && !dbError && authUsers && dbUsers) {
      const authUserIds = new Set(authUsers.map(u => u.id))
      const dbAuthIds = new Set(dbUsers.map(u => u.auth_id).filter(Boolean))
      
      // Users in Auth but not in DB
      const authOnly = authUsers.filter(u => !dbAuthIds.has(u.id))
      if (authOnly.length > 0) {
        console.log(`\n⚠️  ${authOnly.length} user(s) in Supabase Auth but NOT in database:`)
        authOnly.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id})`)
        })
        console.log('   → This causes "profile already exists" error during signup')
      }
      
      // Users in DB but not in Auth
      const dbOnly = dbUsers.filter(u => u.auth_id && !authUserIds.has(u.auth_id))
      if (dbOnly.length > 0) {
        console.log(`\n⚠️  ${dbOnly.length} user(s) in database but NOT in Supabase Auth:`)
        dbOnly.forEach(user => {
          console.log(`   - ${user.email} (Auth ID: ${user.auth_id})`)
        })
        console.log('   → This causes "invalid credentials" error during login')
      }
      
      // Perfect matches
      const matches = authUsers.filter(authUser => 
        dbUsers.some(dbUser => dbUser.auth_id === authUser.id && dbUser.email === authUser.email)
      )
      if (matches.length > 0) {
        console.log(`\n✅ ${matches.length} user(s) properly synced between Auth and Database:`)
        matches.forEach(user => {
          console.log(`   - ${user.email}`)
        })
      }
      
      // Check for orphaned database records (no auth_id)
      const orphaned = dbUsers.filter(u => !u.auth_id)
      if (orphaned.length > 0) {
        console.log(`\n⚠️  ${orphaned.length} orphaned database record(s) (no auth_id):`)
        orphaned.forEach(user => {
          console.log(`   - ${user.email} (DB ID: ${user.id})`)
        })
      }
    }
    
    // 4. Check for duplicate emails
    console.log('\n\n📋 STEP 4: Checking for Duplicate Emails')
    console.log('-'.repeat(70))
    
    if (!dbError && dbUsers) {
      const emailCounts = {}
      dbUsers.forEach(user => {
        if (user.email) {
          emailCounts[user.email] = (emailCounts[user.email] || 0) + 1
        }
      })
      
      const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} duplicate email(s):`)
        duplicates.forEach(([email, count]) => {
          console.log(`   - ${email}: ${count} records`)
        })
      } else {
        console.log('✅ No duplicate emails found')
      }
    }
    
    // 5. Diagnosis Summary
    console.log('\n\n📋 DIAGNOSIS SUMMARY')
    console.log('='.repeat(70))
    
    if (!authError && !dbError && authUsers && dbUsers) {
      const authOnly = authUsers.filter(u => !dbUsers.some(d => d.auth_id === u.id))
      const dbOnly = dbUsers.filter(u => u.auth_id && !authUsers.some(a => a.id === u.auth_id))
      
      if (authOnly.length > 0) {
        console.log('\n🔴 CRITICAL ISSUE FOUND:')
        console.log('   Users exist in Supabase Auth but NOT in database.')
        console.log('   This causes the "profile already exists" error during signup.')
        console.log('\n   SOLUTION:')
        console.log('   1. Delete these users from Supabase Auth, OR')
        console.log('   2. Create corresponding database records for them')
        console.log('\n   Affected emails:')
        authOnly.forEach(u => console.log(`      - ${u.email}`))
      }
      
      if (dbOnly.length > 0) {
        console.log('\n🔴 CRITICAL ISSUE FOUND:')
        console.log('   Users exist in database but NOT in Supabase Auth.')
        console.log('   This causes the "invalid credentials" error during login.')
        console.log('\n   SOLUTION:')
        console.log('   1. Delete these records from database, OR')
        console.log('   2. Have users sign up again to recreate Auth records')
        console.log('\n   Affected emails:')
        dbOnly.forEach(u => console.log(`      - ${u.email}`))
      }
      
      if (authOnly.length === 0 && dbOnly.length === 0) {
        console.log('\n✅ No critical sync issues found!')
        console.log('   All users are properly synced between Auth and Database.')
      }
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('✅ Diagnostic complete!\n')
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message)
    console.error(error)
  }
}

// Run diagnostic
diagnoseAuthIssue()
