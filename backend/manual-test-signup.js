/**
 * Manual Testing Script for Signup Flow
 * Use this to manually test the signup API endpoint
 */

const axios = require('axios').default;

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const SIGNUP_ENDPOINT = `${API_BASE_URL}/api/auth/signup`;

// Test cases
const testCases = [
  {
    name: 'Valid IS Student 2023',
    data: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: '1si23is117@sit.ac.in',
      password: 'TestPassword123!'
    },
    shouldSucceed: true
  },
  {
    name: 'Valid CS Student 2020',
    data: {
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: '1si20cs045@sit.ac.in',
      password: 'SecurePass456!'
    },
    shouldSucceed: true
  },
  {
    name: 'Invalid Email Domain',
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@gmail.com',
      password: 'TestPassword123!'
    },
    shouldSucceed: false,
    expectedError: 'Only SIT email addresses'
  },
  {
    name: 'Invalid USN Format',
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: 'invalid@sit.ac.in',
      password: 'TestPassword123!'
    },
    shouldSucceed: false,
    expectedError: 'Invalid email format'
  },
  {
    name: 'Weak Password',
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: '1si23is118@sit.ac.in',
      password: '123'
    },
    shouldSucceed: false,
    expectedError: 'Password must be at least 8 characters'
  }
];

async function testSignupEndpoint(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📧 Email: ${testCase.data.email}`);
  
  try {
    const response = await axios.post(SIGNUP_ENDPOINT, testCase.data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (testCase.shouldSucceed) {
      console.log('✅ SUCCESS - Signup completed');
      console.log('📋 Response:', {
        success: response.data.success,
        message: response.data.message,
        user: response.data.data?.user
      });
      
      // If successful, you might want to clean up the test user
      console.log('⚠️  Remember to clean up test user from database');
      
    } else {
      console.log('❌ UNEXPECTED SUCCESS - This should have failed');
      console.log('📋 Response:', response.data);
    }

  } catch (error) {
    if (!testCase.shouldSucceed) {
      console.log('✅ EXPECTED FAILURE');
      console.log('📋 Error:', error.response?.data?.message || error.message);
      
      if (testCase.expectedError) {
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage.includes(testCase.expectedError)) {
          console.log('✅ Error message matches expected pattern');
        } else {
          console.log('⚠️  Error message doesn\'t match expected pattern');
          console.log(`Expected: ${testCase.expectedError}`);
          console.log(`Got: ${errorMessage}`);
        }
      }
    } else {
      console.log('❌ UNEXPECTED FAILURE');
      console.log('📋 Error:', error.response?.data || error.message);
      console.log('📋 Status:', error.response?.status);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Manual Signup Tests');
  console.log(`🔗 API Endpoint: ${SIGNUP_ENDPOINT}`);
  console.log('=' .repeat(50));

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      await testSignupEndpoint(testCase);
      passedTests++;
    } catch (error) {
      console.log('💥 Test execution error:', error.message);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests completed`);
  console.log('🏁 Manual testing finished');
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests executed successfully!');
  } else {
    console.log('⚠️  Some tests had execution issues - check logs above');
  }
}

// Helper function to test a single email
async function testSingleEmail(email, password = 'TestPassword123!') {
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: email,
    password: password
  };

  console.log(`\n🧪 Testing single email: ${email}`);
  
  try {
    const response = await axios.post(SIGNUP_ENDPOINT, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    console.log('✅ SUCCESS');
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.log('❌ FAILED');
    console.log('📋 Error:', error.response?.data || error.message);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run all tests
    runAllTests().catch(console.error);
  } else if (args[0] === '--email' && args[1]) {
    // Test single email
    const email = args[1];
    const password = args[2] || 'TestPassword123!';
    testSingleEmail(email, password).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node manual-test-signup.js                    # Run all tests');
    console.log('  node manual-test-signup.js --email <email>    # Test single email');
    console.log('  node manual-test-signup.js --email <email> <password>  # Test with custom password');
    console.log('');
    console.log('Examples:');
    console.log('  node manual-test-signup.js --email 1si23is117@sit.ac.in');
    console.log('  node manual-test-signup.js --email test@gmail.com');
  }
}

module.exports = { testSignupEndpoint, testSingleEmail, runAllTests };
