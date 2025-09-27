/**
 * Supabase Integration Test Script
 * Tests the new Supabase authentication and API endpoints
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test.user@sit.ac.in',
  password: 'TestPassword123!',
  usn: 'SIT999',
  branch: 'Computer Science',
  admissionYear: 2020,
  passingYear: 2024
};

let authToken = '';

/**
 * Test Supabase Authentication Flow
 */
async function testSupabaseAuth() {
  console.log('\n🔐 Testing Supabase Authentication...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/supabase-auth/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Get upload info
    console.log('\n2. Testing upload info...');
    const uploadInfoResponse = await axios.get(`${BASE_URL}/api/storage/info`);
    console.log('✅ Upload info:', uploadInfoResponse.data.data.limits);

    // Test 3: Sign up (this might fail if user already exists)
    console.log('\n3. Testing user signup...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/api/supabase-auth/signup`, testUser);
      console.log('✅ Signup successful:', signupResponse.data.message);
    } catch (signupError) {
      if (signupError.response?.status === 409) {
        console.log('ℹ️ User already exists, continuing with signin...');
      } else {
        console.log('❌ Signup error:', signupError.response?.data?.message || signupError.message);
      }
    }

    // Test 4: Sign in
    console.log('\n4. Testing user signin...');
    try {
      const signinResponse = await axios.post(`${BASE_URL}/api/supabase-auth/signin`, {
        email: testUser.email,
        password: testUser.password
      });
      
      authToken = signinResponse.data.data.session.access_token;
      console.log('✅ Signin successful');
      console.log('   User:', signinResponse.data.data.user.firstName, signinResponse.data.data.user.lastName);
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } catch (signinError) {
      console.log('❌ Signin error:', signinError.response?.data?.message || signinError.message);
      return false;
    }

    // Test 5: Get current user
    console.log('\n5. Testing get current user...');
    try {
      const currentUserResponse = await axios.get(`${BASE_URL}/api/supabase-auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Current user:', currentUserResponse.data.data.user.firstName, currentUserResponse.data.data.user.lastName);
    } catch (currentUserError) {
      console.log('❌ Get current user error:', currentUserError.response?.data?.message || currentUserError.message);
    }

    return true;

  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    return false;
  }
}

/**
 * Test API Endpoints with Authentication
 */
async function testAPIEndpoints() {
  console.log('\n📡 Testing API Endpoints...\n');

  if (!authToken) {
    console.log('❌ No auth token available, skipping API tests');
    return;
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // Test 1: Get user profile
    console.log('1. Testing user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/me`, { headers });
    console.log('✅ User profile retrieved');

    // Test 2: Get alumni directory
    console.log('\n2. Testing alumni directory...');
    const directoryResponse = await axios.get(`${BASE_URL}/api/directory`, { headers });
    console.log('✅ Alumni directory:', directoryResponse.data.data?.alumni?.length || 0, 'alumni found');

    // Test 3: Get jobs
    console.log('\n3. Testing jobs endpoint...');
    const jobsResponse = await axios.get(`${BASE_URL}/api/jobs`, { headers });
    console.log('✅ Jobs:', jobsResponse.data.data?.jobs?.length || 0, 'jobs found');

    // Test 4: Get events
    console.log('\n4. Testing events endpoint...');
    const eventsResponse = await axios.get(`${BASE_URL}/api/events`, { headers });
    console.log('✅ Events:', eventsResponse.data.data?.events?.length || 0, 'events found');

    // Test 5: Get badges
    console.log('\n5. Testing badges endpoint...');
    const badgesResponse = await axios.get(`${BASE_URL}/api/badges`, { headers });
    console.log('✅ Badges endpoint accessible');

  } catch (error) {
    console.log('❌ API endpoint test failed:', error.response?.data?.message || error.message);
  }
}

/**
 * Test Database Connection
 */
async function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...\n');

  try {
    // Test the Supabase connection by trying to create sample data
    console.log('1. Testing database setup...');
    const { exec } = require('child_process');
    
    exec('node database/setup_supabase.js', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Database setup error:', error.message);
      } else {
        console.log('✅ Database setup output:');
        console.log(stdout);
      }
    });

  } catch (error) {
    console.log('❌ Database connection test failed:', error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Supabase Integration Tests...');
  console.log('=====================================');

  // Test 1: Database Connection
  await testDatabaseConnection();

  // Wait a bit for database setup
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Authentication
  const authSuccess = await testSupabaseAuth();

  // Test 3: API Endpoints (only if auth successful)
  if (authSuccess) {
    await testAPIEndpoints();
  }

  console.log('\n=====================================');
  console.log('🏁 Tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. If tests failed, check Supabase configuration in .env');
  console.log('2. Ensure database schema is created in Supabase dashboard');
  console.log('3. Verify RLS policies are set up correctly');
  console.log('4. Check storage buckets are created');
  console.log('\n📚 Documentation: See SUPABASE_SETUP.md for detailed setup instructions');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
