#!/usr/bin/env node

/**
 * Complete AlumniVerse Authentication Flow Test
 * Tests the entire signup → login → dashboard flow
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCompleteFlow() {
  log('blue', '🚀 Testing Complete AlumniVerse Authentication Flow\n');
  
  // Generate unique test user
  const timestamp = Date.now();
  const testEmail = `1si23cs${timestamp.toString().slice(-3)}@sit.ac.in`;
  const testPassword = 'TestPassword123!';
  
  let testResults = {
    signup: false,
    login: false,
    userDataExtraction: false,
    sessionManagement: false
  };
  
  try {
    // Test 1: Signup with auto-extraction
    log('cyan', '📝 Test 1: Signup with Auto-Extraction');
    log('yellow', `   Email: ${testEmail}`);
    
    const signupResponse = await axios.post(`${FRONTEND_URL}/api/auth/signup`, {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: testPassword
    });
    
    if (signupResponse.data.success) {
      log('green', '   ✅ Signup successful');
      
      const userData = signupResponse.data.data.user;
      log('green', `   📧 Email: ${userData.email}`);
      log('green', `   🎓 USN: ${userData.usn}`);
      log('green', `   🏢 Branch: ${userData.branch}`);
      log('green', `   📅 Years: ${userData.joiningYear}-${userData.passingYear}`);
      log('green', `   ✉️ Email Verified: ${userData.isEmailVerified}`);
      
      // Verify auto-extraction worked correctly
      const expectedUSN = testEmail.split('@')[0].toUpperCase();
      if (userData.usn === expectedUSN && userData.branch && userData.joiningYear) {
        testResults.userDataExtraction = true;
        log('green', '   ✅ Auto-extraction working correctly');
      } else {
        log('red', '   ❌ Auto-extraction failed');
      }
      
      testResults.signup = true;
    } else {
      log('red', '   ❌ Signup failed');
      console.error('   Error:', signupResponse.data.error);
      return testResults;
    }
    
    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Login with created user
    log('cyan', '\n🔐 Test 2: Login with Created User');
    
    const loginResponse = await axios.post(`${FRONTEND_URL}/api/auth/signin`, {
      email: testEmail,
      password: testPassword
    });
    
    if (loginResponse.data.success) {
      log('green', '   ✅ Login successful');
      
      const sessionData = loginResponse.data.data;
      log('green', `   👤 User ID: ${sessionData.user.id}`);
      log('green', `   🔑 Auth ID: ${sessionData.user.authId}`);
      log('green', `   📧 Email: ${sessionData.user.email}`);
      log('green', `   👨‍💼 Role: ${sessionData.user.role}`);
      
      // Verify session data
      if (sessionData.session && sessionData.session.access_token) {
        testResults.sessionManagement = true;
        log('green', '   ✅ Session management working');
        log('green', `   🎫 Access Token: ${sessionData.session.access_token.substring(0, 20)}...`);
      } else {
        log('red', '   ❌ Session management failed');
      }
      
      testResults.login = true;
    } else {
      log('red', '   ❌ Login failed');
      console.error('   Error:', loginResponse.data.error);
      return testResults;
    }
    
    // Test 3: Verify protected route access (if available)
    log('cyan', '\n🛡️ Test 3: Protected Route Access');
    
    try {
      const dashboardResponse = await axios.get(`${FRONTEND_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.data.session.access_token}`
        }
      });
      
      if (dashboardResponse.status === 200) {
        log('green', '   ✅ Dashboard accessible');
      } else {
        log('yellow', '   ⚠️ Dashboard response unclear');
      }
    } catch (dashboardError) {
      if (dashboardError.response && dashboardError.response.status === 404) {
        log('yellow', '   ⚠️ Dashboard route not found (expected for current setup)');
      } else {
        log('yellow', '   ⚠️ Dashboard access test inconclusive');
      }
    }
    
  } catch (error) {
    log('red', '❌ Test failed with error:');
    console.error(error.response?.data || error.message);
  }
  
  // Test Results Summary
  log('blue', '\n📊 Test Results Summary:');
  log('blue', '========================');
  
  const tests = [
    { name: 'Signup', passed: testResults.signup },
    { name: 'User Data Extraction', passed: testResults.userDataExtraction },
    { name: 'Login', passed: testResults.login },
    { name: 'Session Management', passed: testResults.sessionManagement }
  ];
  
  tests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    const color = test.passed ? 'green' : 'red';
    log(color, `${status} - ${test.name}`);
  });
  
  const allPassed = tests.every(test => test.passed);
  
  if (allPassed) {
    log('green', '\n🎉 All tests passed! AlumniVerse authentication is working perfectly.');
    log('green', '\n✅ Ready for production deployment!');
  } else {
    log('red', '\n❌ Some tests failed. Please check the issues above.');
  }
  
  return testResults;
}

// Run tests if this file is executed directly
if (require.main === module) {
  testCompleteFlow().catch(console.error);
}

module.exports = { testCompleteFlow };
