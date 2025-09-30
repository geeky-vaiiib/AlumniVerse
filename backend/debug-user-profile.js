#!/usr/bin/env node

/**
 * Debug script to check user profiles in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugUserProfiles() {
  console.log('🔍 Debugging User Profiles...\n');
  
  try {
    // Get all users from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users in the database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User Profile:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Auth ID: ${user.auth_id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   USN: ${user.usn}`);
      console.log(`   Branch: ${user.branch}`);
      console.log(`   Email Verified: ${user.is_email_verified}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users:\n`);
    
    authUsers.users.forEach((authUser, index) => {
      console.log(`${index + 1}. Auth User:`);
      console.log(`   ID: ${authUser.id}`);
      console.log(`   Email: ${authUser.email}`);
      console.log(`   Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Created: ${authUser.created_at}`);
      console.log('');
    });
    
    // Check for mismatches
    console.log('🔍 Checking for auth_id mismatches...\n');
    
    const authIds = authUsers.users.map(u => u.id);
    const profileAuthIds = users.map(u => u.auth_id);
    
    const orphanedProfiles = users.filter(u => !authIds.includes(u.auth_id));
    const orphanedAuthUsers = authUsers.users.filter(u => !profileAuthIds.includes(u.id));
    
    if (orphanedProfiles.length > 0) {
      console.log('❌ Orphaned Profiles (no matching auth user):');
      orphanedProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (auth_id: ${profile.auth_id})`);
      });
      console.log('');
    }
    
    if (orphanedAuthUsers.length > 0) {
      console.log('❌ Orphaned Auth Users (no matching profile):');
      orphanedAuthUsers.forEach(authUser => {
        console.log(`   - ${authUser.email} (id: ${authUser.id})`);
      });
      console.log('');
    }
    
    if (orphanedProfiles.length === 0 && orphanedAuthUsers.length === 0) {
      console.log('✅ All profiles and auth users are properly linked!');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run debug if this file is executed directly
if (require.main === module) {
  debugUserProfiles()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugUserProfiles };
