/**
 * Supabase Authentication Controller
 * Handles authentication using 100% Supabase Auth (no custom OTP logic)
 */

const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Parse USN from SIT email to extract student information
 */
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
      'ai': 'Artificial Intelligence',
      'ml': 'Machine Learning'
    };

    const branch = branchMap[branchCode.toLowerCase()] || 'Unknown';
    const passingYear = joiningYear + 4; // Assuming 4-year course

    return {
      usn: localPart.toUpperCase(),
      branch,
      branchCode: branchCode.toUpperCase(),
      joiningYear,
      passingYear
    };
  } catch (error) {
    throw new Error(`Failed to parse USN: ${error.message}`);
  }
};

/**
 * Validation middleware for signup
 */
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom((value) => {
      if (!value.endsWith('@sit.ac.in')) {
        throw new Error('Please use your SIT institutional email (@sit.ac.in)');
      }
      return true;
    }),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

/**
 * Validation middleware for signin
 */
const signinValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom((value) => {
      if (!value.endsWith('@sit.ac.in')) {
        throw new Error('Please use your SIT institutional email (@sit.ac.in)');
      }
      return true;
    })
];

/**
 * Validation middleware for OTP verification
 */
const verifyOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

/**
 * Sign up user with OTP (Supabase Auth)
 */
const signup = catchAsync(async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { firstName, lastName, email } = req.body;

  try {
    // Parse USN data from email
    const usnData = parseUSNFromEmail(email);

    // Prepare user metadata
    const metadata = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      usn: usnData.usn,
      branch: usnData.branch,
      branch_code: usnData.branchCode,
      joining_year: usnData.joiningYear,
      passing_year: usnData.passingYear
    };

    console.log('Sending OTP via Supabase Auth for:', email);

    // Send OTP using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        data: metadata,
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);

      if (error.message?.includes('already registered')) {
        return next(new AppError('Email already registered. Please sign in instead.', 409));
      }

      return next(new AppError(error.message || 'Failed to send verification code', 400));
    }

    console.log('OTP sent successfully via Supabase:', data);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: email.toLowerCase().trim(),
        messageId: data?.messageId || 'sent'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return next(new AppError(error.message || 'Signup failed', 500));
  }
});

/**
 * Sign in user with OTP (Supabase Auth)
 */
const signin = catchAsync(async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email } = req.body;

  try {
    console.log('Sending login OTP via Supabase Auth for:', email);

    // Send OTP using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      console.error('Supabase signin error:', error);

      if (error.message?.includes('not found') || error.message?.includes('invalid')) {
        return next(new AppError('No account found with this email. Please sign up first.', 404));
      }

      return next(new AppError(error.message || 'Failed to send verification code', 400));
    }

    console.log('Login OTP sent successfully via Supabase:', data);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: email.toLowerCase().trim(),
        messageId: data?.messageId || 'sent'
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    return next(new AppError(error.message || 'Signin failed', 500));
  }
});

/**
 * Verify OTP (Supabase Auth)
 */
const verifyOTP = catchAsync(async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email, token } = req.body;

  try {
    console.log('Verifying OTP via Supabase Auth for:', email);

    // Verify OTP using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token,
      type: 'email'
    });

    if (error) {
      console.error('Supabase OTP verification error:', error);

      if (error.message?.includes('expired')) {
        return next(new AppError('Verification code has expired. Please request a new one.', 400));
      } else if (error.message?.includes('invalid')) {
        return next(new AppError('Invalid verification code. Please try again.', 400));
      }

      return next(new AppError(error.message || 'Verification failed', 400));
    }

    console.log('OTP verified successfully via Supabase:', data.user?.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: data.user,
        session: data.session
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return next(new AppError(error.message || 'Verification failed', 500));
  }
});

module.exports = {
  signup,
  signin,
  verifyOTP,
  signupValidation,
  signinValidation,
  verifyOTPValidation
};