#!/usr/bin/env node
/**
 * Test the idempotent profile creation fix
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://flcgwqlabywhoulqalaz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g'
const BASE_URL = 'http://localhost:3002'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const fetch = globalThis.fetch

async function testIdempotentProfileCreation() {
  console.log('🔧 Testing Idempotent Profile Creation')
  console.log('=' .repeat(40))
  
  // Generate a proper UUID for testing
  const testAuthId = crypto.randomUUID()
  const testEmail = 'idempotent.test@sit.ac.in'
  
  const profileData = {
    auth_id: testAuthId,
    email: testEmail,
    first_name: 'Idempotent',
    last_name: 'Test',
    usn: '1SI20CS998',
    branch: 'Computer Science',
    admission_year: 2020,
    passing_year: 2024
  }
  
  console.log('📤 First profile creation request...')
  
  // First request - should create
  const response1 = await fetch(`${BASE_URL}/api/profile/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  })
  
  const result1 = await response1.json()
  
  console.log(`Status: ${response1.status}`)
  console.log(`Response: ${JSON.stringify(result1, null, 2)}`)
  
  if (response1.status === 200 || response1.status === 201) {
    console.log('✅ First request: Profile created successfully')
  } else {
    console.log('❌ First request failed')
    return
  }
  
  console.log('\n📤 Second profile creation request (duplicate)...')
  
  // Second request - should return existing profile
  const response2 = await fetch(`${BASE_URL}/api/profile/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  })
  
  const result2 = await response2.json()
  
  console.log(`Status: ${response2.status}`)
  console.log(`Response: ${JSON.stringify(result2, null, 2)}`)
  
  if (response2.status === 200) {
    console.log('✅ Second request: Idempotent behavior working!')
    console.log('✅ Fix successful: No more 409 conflicts')
  } else if (response2.status === 409) {
    console.log('❌ Still getting 409 - fix not working')
  } else {
    console.log(`❌ Unexpected status: ${response2.status}`)
  }
  
  // Cleanup test data
  console.log('\n🧹 Cleaning up test data...')
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('auth_id', testAuthId)
  
  if (error) {
    console.log('⚠️  Cleanup failed:', error.message)
  } else {
    console.log('✅ Test data cleaned up')
  }
}

testIdempotentProfileCreation().catch(console.error)
