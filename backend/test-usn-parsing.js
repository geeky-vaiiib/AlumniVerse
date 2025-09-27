/**
 * Unit test for USN parsing functionality
 * Tests the USN parsing logic without requiring Supabase credentials
 */

// Extract the parseUSNFromEmail function for testing
const parseUSNFromEmail = (email) => {
  try {
    const localPart = email.split('@')[0]; // e.g., "1si23is117"
    
    // Validate USN format (should be like: 1si23is117)
    const usnRegex = /^(\d)([a-z]{2})(\d{2})([a-z]{2})(\d{3})$/i;
    const match = localPart.match(usnRegex);
    
    if (!match) {
      throw new Error('Invalid USN format in email');
    }

    const [, , , yearDigits, branchCode] = match;
    
    // Convert year digits to full year (23 -> 2023)
    const currentYear = new Date().getFullYear();
    const currentYearLastTwo = currentYear % 100;
    let joiningYear;
    
    const year = parseInt(yearDigits);
    if (year <= currentYearLastTwo + 5) { // Allow up to 5 years in future
      joiningYear = 2000 + year;
    } else {
      joiningYear = 1900 + year;
    }

    // Branch code mapping
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
      passingYear: joiningYear + 4, // Assuming 4-year degree
      branch: branchName,
      branchCode: branchCode.toUpperCase()
    };
  } catch (error) {
    throw new Error(`Failed to parse USN: ${error.message}`);
  }
};

async function testUSNParsing() {
  console.log('🧪 Starting USN parsing tests...');
  
  const testCases = [
    {
      email: '1si23is117@sit.ac.in',
      expected: {
        usn: '1SI23IS117',
        joiningYear: 2023,
        passingYear: 2027,
        branch: 'Information Science',
        branchCode: 'IS'
      }
    },
    {
      email: '1si20cs045@sit.ac.in',
      expected: {
        usn: '1SI20CS045',
        joiningYear: 2020,
        passingYear: 2024,
        branch: 'Computer Science',
        branchCode: 'CS'
      }
    },
    {
      email: '1si22ec089@sit.ac.in',
      expected: {
        usn: '1SI22EC089',
        joiningYear: 2022,
        passingYear: 2026,
        branch: 'Electronics and Communication',
        branchCode: 'EC'
      }
    }
  ];

  const invalidTestCases = [
    'invalid@sit.ac.in',
    '123@sit.ac.in',
    'si23is117@sit.ac.in', // Missing first digit
    '1si23xx117@sit.ac.in', // Invalid branch code
    '1si23is@sit.ac.in' // Missing USN number
  ];

  let passedTests = 0;
  let totalTests = testCases.length + invalidTestCases.length;

  // Test valid cases
  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Testing: ${testCase.email}`);
      const result = parseUSNFromEmail(testCase.email);
      
      // Check all expected properties
      const isValid = 
        result.usn === testCase.expected.usn &&
        result.joiningYear === testCase.expected.joiningYear &&
        result.passingYear === testCase.expected.passingYear &&
        result.branch === testCase.expected.branch &&
        result.branchCode === testCase.expected.branchCode;

      if (isValid) {
        console.log('✅ PASS - Parsed correctly:', result);
        passedTests++;
      } else {
        console.log('❌ FAIL - Expected:', testCase.expected);
        console.log('❌ FAIL - Got:', result);
      }
    } catch (error) {
      console.log('❌ FAIL - Error:', error.message);
    }
  }

  // Test invalid cases (should throw errors)
  for (const invalidEmail of invalidTestCases) {
    try {
      console.log(`\n📝 Testing invalid: ${invalidEmail}`);
      parseUSNFromEmail(invalidEmail);
      console.log('❌ FAIL - Should have thrown an error');
    } catch (error) {
      console.log('✅ PASS - Correctly rejected:', error.message);
      passedTests++;
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All USN parsing tests passed!');
    return { success: true, passed: passedTests, total: totalTests };
  } else {
    console.log('❌ Some tests failed');
    return { success: false, passed: passedTests, total: totalTests };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testUSNParsing()
    .then(result => {
      console.log('\n📋 Final Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testUSNParsing, parseUSNFromEmail };
