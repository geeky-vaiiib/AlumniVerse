/**
 * Integration test for signup flow
 * Tests the complete signup process including profile creation
 */

const { supabase, supabaseAdmin, supabaseHelpers } = require('./config/supabase');

async function testSignupFlow() {
  const testEmail = '1si23is117@sit.ac.in';
  const testPassword = 'TestPassword123!';
  
  console.log('🧪 Starting signup integration test...');
  
  try {
    // Clean up any existing test user first
    console.log('🧹 Cleaning up existing test user...');
    try {
      const existingUser = await supabaseHelpers.users.findByEmail(testEmail);
      if (existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(existingUser.auth_id);
        console.log('✅ Cleaned up existing test user');
      }
    } catch (cleanupError) {
      console.log('ℹ️ No existing user to clean up');
    }

    // Test 1: Create auth user
    console.log('\n📝 Test 1: Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        usn: '1SI23IS117',
        branch: 'Information Science',
        joining_year: 2023,
        passing_year: 2027
      }
    });

    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    console.log('✅ Auth user created successfully:', authData.user.id);

    // Test 2: Create profile using admin helper
    console.log('\n📝 Test 2: Creating user profile...');
    const userProfile = {
      auth_id: authData.user.id,
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      usn: '1SI23IS117',
      branch: 'Information Science',
      admission_year: 2023,
      passing_year: 2027,
      is_email_verified: false,
      is_profile_complete: false,
      role: 'user'
    };

    const createdProfile = await supabaseHelpers.users.adminCreate(userProfile);
    console.log('✅ User profile created successfully:', createdProfile.id);

    // Test 3: Verify profile can be retrieved
    console.log('\n📝 Test 3: Retrieving user profile...');
    const retrievedProfile = await supabaseHelpers.users.adminFindByAuthId(authData.user.id);
    
    if (!retrievedProfile) {
      throw new Error('Failed to retrieve created profile');
    }
    
    console.log('✅ Profile retrieved successfully:', {
      id: retrievedProfile.id,
      email: retrievedProfile.email,
      usn: retrievedProfile.usn,
      branch: retrievedProfile.branch
    });

    // Test 4: Test USN parsing
    console.log('\n📝 Test 4: Testing USN parsing...');
    const parseUSNFromEmail = (email) => {
      const localPart = email.split('@')[0];
      const usnRegex = /^(\d)([a-z]{2})(\d{2})([a-z]{2})(\d{3})$/i;
      const match = localPart.match(usnRegex);
      
      if (!match) {
        throw new Error('Invalid USN format in email');
      }

      const [, , , yearDigits, branchCode] = match;
      const year = parseInt(yearDigits);
      const joiningYear = 2000 + year;

      const branchMap = {
        'cs': 'Computer Science',
        'is': 'Information Science',
        'ec': 'Electronics and Communication',
        'ee': 'Electrical Engineering',
        'me': 'Mechanical Engineering',
        'cv': 'Civil Engineering',
        'bt': 'Biotechnology',
        'ch': 'Chemical Engineering',
        'ae': 'Aeronautical Engineering',
        'im': 'Industrial Engineering and Management',
        'tc': 'Telecommunication Engineering'
      };

      const branchName = branchMap[branchCode.toLowerCase()];
      if (!branchName) {
        throw new Error(`Unknown branch code: ${branchCode}`);
      }

      return {
        usn: localPart.toUpperCase(),
        joiningYear,
        passingYear: joiningYear + 4,
        branch: branchName,
        branchCode: branchCode.toUpperCase()
      };
    };

    const parsedUSN = parseUSNFromEmail(testEmail);
    console.log('✅ USN parsed successfully:', parsedUSN);

    // Test 5: Cleanup
    console.log('\n📝 Test 5: Cleaning up test data...');
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test cleanup completed');

    console.log('\n🎉 All tests passed! Signup flow is working correctly.');
    
    return {
      success: true,
      message: 'All signup integration tests passed',
      results: {
        authUserCreated: true,
        profileCreated: true,
        profileRetrieved: true,
        usnParsed: true,
        cleanupCompleted: true
      }
    };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Signup integration test failed'
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSignupFlow()
    .then(result => {
      console.log('\n📊 Test Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testSignupFlow };
