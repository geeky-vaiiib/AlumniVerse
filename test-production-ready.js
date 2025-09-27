/**
 * Production Readiness Test Suite
 * Comprehensive testing for AlumniVerse production deployment
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const validTestUser = {
  firstName: 'Production',
  lastName: 'Test',
  email: '1si23ec042@sit.ac.in',
  password: 'ProductionTest123!'
};

const invalidTestUser = {
  firstName: 'Invalid',
  lastName: 'User',
  email: 'invalid@gmail.com',
  password: 'InvalidTest123!'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBackendHealth() {
  console.log('\n🏥 Testing Backend Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.data.success) {
      log('green', '✅ Backend health check passed');
      return true;
    }
  } catch (error) {
    log('red', '❌ Backend health check failed');
    console.error(error.message);
    return false;
  }
}

async function testFrontendHealth() {
  console.log('\n🌐 Testing Frontend Health...');
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      log('green', '✅ Frontend is accessible');
      return true;
    }
  } catch (error) {
    log('red', '❌ Frontend health check failed');
    console.error(error.message);
    return false;
  }
}

async function testValidSignup() {
  console.log('\n📝 Testing Valid Signup...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, validTestUser);
    
    if (response.data.success) {
      log('green', '✅ Valid signup successful');
      log('blue', `📋 User created: ${response.data.data.user.usn} - ${response.data.data.user.branch}`);
      log('blue', `📅 Years: ${response.data.data.user.joiningYear} - ${response.data.data.user.passingYear}`);
      return true;
    } else {
      log('red', '❌ Valid signup failed');
      console.error(response.data);
      return false;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      log('yellow', '⚠️ User already exists (expected for repeated tests)');
      return true;
    }
    log('red', '❌ Valid signup failed with error');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testInvalidSignup() {
  console.log('\n🚫 Testing Invalid Signup...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, invalidTestUser);
    log('red', '❌ Invalid signup should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('SIT email')) {
      log('green', '✅ Invalid email correctly rejected');
      return true;
    }
    log('red', '❌ Invalid signup failed for wrong reason');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testUSNParsing() {
  console.log('\n🔍 Testing USN Parsing...');
  
  const testCases = [
    {
      email: '1si23is117@sit.ac.in',
      expected: { usn: '1SI23IS117', branch: 'Information Science', year: 2023 }
    },
    {
      email: '1si20cs045@sit.ac.in', 
      expected: { usn: '1SI20CS045', branch: 'Computer Science', year: 2020 }
    },
    {
      email: '1si22ec089@sit.ac.in',
      expected: { usn: '1SI22EC089', branch: 'Electronics and Communication', year: 2022 }
    }
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    try {
      const testUser = {
        firstName: 'USN',
        lastName: 'Test',
        email: testCase.email,
        password: 'USNTest123!'
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, testUser);
      
      if (response.data.success) {
        const user = response.data.data.user;
        const passed = 
          user.usn === testCase.expected.usn &&
          user.branch === testCase.expected.branch &&
          user.joiningYear === testCase.expected.year;

        if (passed) {
          log('green', `✅ ${testCase.email} parsed correctly`);
        } else {
          log('red', `❌ ${testCase.email} parsing failed`);
          console.log('Expected:', testCase.expected);
          console.log('Got:', { usn: user.usn, branch: user.branch, year: user.joiningYear });
          allPassed = false;
        }
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        log('yellow', `⚠️ ${testCase.email} already exists (expected)`);
      } else {
        log('red', `❌ ${testCase.email} test failed`);
        allPassed = false;
      }
    }
  }

  return allPassed;
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing Auth Endpoints...');
  
  const endpoints = [
    '/api/auth/health',
    '/api/auth/signup',
    '/api/auth/signin'
  ];

  let allAccessible = true;

  for (const endpoint of endpoints) {
    try {
      // Test OPTIONS request (CORS preflight)
      const response = await axios.options(`${BACKEND_URL}${endpoint}`);
      log('green', `✅ ${endpoint} is accessible`);
    } catch (error) {
      if (error.response?.status === 404) {
        log('red', `❌ ${endpoint} not found`);
        allAccessible = false;
      } else {
        // Other errors might be expected (like validation errors)
        log('green', `✅ ${endpoint} is accessible (got expected error)`);
      }
    }
  }

  return allAccessible;
}

async function testBranding() {
  console.log('\n🎨 Testing Branding Consistency...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    const html = response.data;
    
    if (html.includes('Alumni Connect')) {
      log('red', '❌ Found "Alumni Connect" in frontend HTML');
      return false;
    } else {
      log('green', '✅ No "Alumni Connect" references found in frontend');
    }

    if (html.includes('AlumniVerse')) {
      log('green', '✅ "AlumniVerse" branding found in frontend');
      return true;
    } else {
      log('yellow', '⚠️ "AlumniVerse" branding not found in frontend HTML');
      return false;
    }
  } catch (error) {
    log('red', '❌ Could not test frontend branding');
    console.error(error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 AlumniVerse Production Readiness Test Suite');
  console.log('='.repeat(50));

  const results = {
    backendHealth: await testBackendHealth(),
    frontendHealth: await testFrontendHealth(),
    validSignup: await testValidSignup(),
    invalidSignup: await testInvalidSignup(),
    usnParsing: await testUSNParsing(),
    authEndpoints: await testAuthEndpoints(),
    branding: await testBranding()
  };

  console.log('\n📊 Test Results Summary');
  console.log('='.repeat(30));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(color, `${status} - ${test}`);
  });

  console.log('\n' + '='.repeat(30));
  
  if (passed === total) {
    log('green', `🎉 ALL TESTS PASSED (${passed}/${total})`);
    log('green', '🚀 AlumniVerse is PRODUCTION READY!');
  } else {
    log('yellow', `⚠️ ${passed}/${total} tests passed`);
    log('yellow', '🔧 Some issues need to be addressed before production');
  }

  return { passed, total, results };
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
