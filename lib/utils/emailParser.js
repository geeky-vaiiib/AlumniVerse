/**
 * Email Parser Utility for Institutional Email IDs
 * Parses @sit.ac.in emails to extract student details
 */

// Branch mapping dictionary
const BRANCH_MAPPING = {
  'cs': 'Computer Science',
  'is': 'Information Science',
  'ec': 'Electronics & Communication',
  'me': 'Mechanical Engineering',
  'cv': 'Civil Engineering',
  'ee': 'Electrical Engineering',
  'ae': 'Aeronautical Engineering',
  'bt': 'Biotechnology',
  'ch': 'Chemical Engineering',
  'im': 'Industrial Engineering & Management',
  'tc': 'Telecommunication Engineering',
  'ai': 'Artificial Intelligence & Machine Learning',
  'ds': 'Data Science',
  'cy': 'Cyber Security'
}

/**
 * Validates if email is from allowed institutional domain
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid institutional email
 */
export function isValidInstitutionalEmail(email) {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'sit.ac.in'
  return email.toLowerCase().endsWith(`@${allowedDomain}`)
}

/**
 * Parses institutional email to extract student details
 * Format: 1si23is117@sit.ac.in
 * - 1si23is117 → USN
 * - 23 → Joining year (2023)
 * - is → Branch code (Information Science)
 * 
 * @param {string} email - Institutional email address
 * @returns {Object} - Parsed student details or null if parsing fails
 */
export function parseInstitutionalEmail(email) {
  try {
    // Validate email format first
    if (!isValidInstitutionalEmail(email)) {
      throw new Error('Invalid institutional email domain')
    }

    // Extract username part (before @)
    const username = email.split('@')[0].toLowerCase()
    
    // Validate username format using regex
    // Expected format: [digit][branch_code][year][branch_code][roll_number]
    // Example: 1si23is117 or 4cs21cs045
    // Note: Some emails might have format like 1si23is117 where first part is semester+branch
    const usnRegex = /^(\d)([a-z]{2})(\d{2})([a-z]{2})(\d{3})$/
    const match = username.match(usnRegex)

    if (!match) {
      throw new Error('Invalid USN format in email')
    }

    const [, semester, branchCode1, yearDigits, branchCode2, rollNumber] = match

    // Use the second branch code as the primary one (more reliable)
    const branchCode = branchCode2

    // Parse year - convert 2-digit year to 4-digit
    const currentYear = new Date().getFullYear()
    const currentCentury = Math.floor(currentYear / 100) * 100
    let joiningYear = currentCentury + parseInt(yearDigits)
    
    // Handle year rollover (if parsed year is more than 10 years in future, assume previous century)
    if (joiningYear > currentYear + 10) {
      joiningYear -= 100
    }

    // Calculate passing year (4-year course)
    const passingYear = joiningYear + 4

    // Get branch name from mapping
    const branchName = BRANCH_MAPPING[branchCode]
    if (!branchName) {
      throw new Error(`Unknown branch code: ${branchCode}`)
    }

    // Return parsed details
    return {
      usn: username.toUpperCase(),
      branch: branchName,
      branchCode: branchCode.toUpperCase(),
      joiningYear,
      passingYear,
      semester: parseInt(semester),
      rollNumber: parseInt(rollNumber),
      isValid: true
    }

  } catch (error) {
    console.error('Email parsing error:', error.message)
    return {
      isValid: false,
      error: error.message
    }
  }
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid, errors, and checks
 */
export function validatePassword(password) {
  const errors = []
  const checks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  }

  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors, checks }
  }

  // Check each requirement
  checks.length = password.length >= 8
  if (!checks.length) {
    errors.push('Password must be at least 8 characters long')
  }

  checks.uppercase = /[A-Z]/.test(password)
  if (!checks.uppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }

  checks.lowercase = /[a-z]/.test(password)
  if (!checks.lowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }

  checks.number = /\d/.test(password)
  if (!checks.number) {
    errors.push('Password must contain at least one number')
  }

  checks.special = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  if (!checks.special) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks
  }
}

/**
 * Validates all signup form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with isValid, errors, and parsedData
 */
export function validateSignupData(formData) {
  const { email, password, firstName, lastName } = formData
  const errors = {}

  // Validate required fields
  if (!firstName?.trim()) {
    errors.firstName = 'First name is required'
  } else if (firstName.trim().length < 2 || firstName.trim().length > 50) {
    errors.firstName = 'First name must be 2-50 characters'
  }

  if (!lastName?.trim()) {
    errors.lastName = 'Last name is required'
  } else if (lastName.trim().length < 2 || lastName.trim().length > 50) {
    errors.lastName = 'Last name must be 2-50 characters'
  }

  if (!email?.trim()) {
    errors.email = 'Email is required'
  } else {
    // Validate institutional email
    if (!isValidInstitutionalEmail(email)) {
      errors.email = 'Please use your institutional email (@sit.ac.in)'
    } else {
      // Parse email to extract student details
      const parsedData = parseInstitutionalEmail(email)
      if (!parsedData.isValid) {
        errors.email = `Invalid email format: ${parsedData.error}`
      }
    }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors.join(', ')
  }

  // Parse email data if email is valid
  let parsedEmailData = null
  if (!errors.email && email) {
    parsedEmailData = parseInstitutionalEmail(email)
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsedData: parsedEmailData
  }
}
