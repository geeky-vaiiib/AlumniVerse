/**
 * Supabase Authentication Controller
 * Handles authentication using Supabase Auth with SIT email validation
 */

const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
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

/**
 * Sign up new user with SIT email validation and automatic USN parsing
 */
const signup = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { firstName, lastName, email, password } = req.body;
  const operationId = `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[${operationId}] Starting signup process for email: ${email}`);

  // Validate SIT email domain
  if (!email.endsWith('@sit.ac.in')) {
    console.log(`[${operationId}] Invalid email domain: ${email}`);
    return next(new AppError('Only SIT email addresses (@sit.ac.in) are allowed', 400));
  }

  // Parse USN information from email
  let parsedUSN;
  try {
    parsedUSN = parseUSNFromEmail(email);
    console.log(`[${operationId}] Parsed USN data:`, parsedUSN);
  } catch (error) {
    console.log(`[${operationId}] USN parsing failed:`, error.message);
    return next(new AppError(`Invalid email format. Expected format: USN@sit.ac.in (e.g., 1si23is117@sit.ac.in). ${error.message}`, 400));
  }

  let authUserId = null;

  try {
    // Check if user already exists
    const existingUser = await supabaseHelpers.users.findByEmail(email);
    if (existingUser) {
      console.log(`[${operationId}] User already exists with email: ${email}`);
      return next(new AppError('User with this email already exists', 409));
    }

    // Create user in Supabase Auth
    console.log(`[${operationId}] Creating auth user...`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll handle email confirmation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        usn: parsedUSN.usn,
        branch: parsedUSN.branch,
        joining_year: parsedUSN.joiningYear,
        passing_year: parsedUSN.passingYear
      }
    });

    if (authError) {
      console.error(`[${operationId}] Auth user creation failed:`, authError);
      if (authError.message.includes('already registered')) {
        return next(new AppError('User with this email already exists', 409));
      }
      throw authError;
    }

    authUserId = authData.user.id;
    console.log(`[${operationId}] Auth user created successfully with ID: ${authUserId}`);

    // Create user profile in our users table using admin client (bypasses RLS)
    const userProfile = {
      auth_id: authUserId,
      first_name: firstName,
      last_name: lastName,
      email,
      usn: parsedUSN.usn,
      branch: parsedUSN.branch,
      admission_year: parsedUSN.joiningYear,
      passing_year: parsedUSN.passingYear,
      is_email_verified: false,
      is_profile_complete: false,
      role: 'user'
    };

    console.log(`[${operationId}] Creating user profile...`);
    const createdUser = await supabaseHelpers.users.adminCreate(userProfile);
    console.log(`[${operationId}] User profile created successfully with ID: ${createdUser.id}`);

    // Send email verification
    console.log(`[${operationId}] Sending email verification...`);
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    if (emailError) {
      console.error(`[${operationId}] Email verification error:`, emailError);
      // Don't fail the signup if email sending fails
    } else {
      console.log(`[${operationId}] Email verification sent successfully`);
    }

    console.log(`[${operationId}] Signup completed successfully`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification link.',
      data: {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.first_name,
          lastName: createdUser.last_name,
          usn: createdUser.usn,
          branch: createdUser.branch,
          joiningYear: createdUser.admission_year,
          passingYear: createdUser.passing_year,
          isEmailVerified: createdUser.is_email_verified,
          isProfileComplete: createdUser.is_profile_complete
        }
      }
    });

  } catch (error) {
    console.error(`[${operationId}] Signup error:`, error);

    // Cleanup: If profile creation failed but auth user was created, delete the auth user
    if (authUserId) {
      try {
        console.log(`[${operationId}] Cleaning up auth user: ${authUserId}`);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log(`[${operationId}] Auth user cleanup completed`);
      } catch (cleanupError) {
        console.error(`[${operationId}] Failed to cleanup auth user:`, cleanupError);
      }
    }

    // Return user-friendly error message
    if (error.message && error.message.includes('duplicate key')) {
      return next(new AppError('An account with this email or USN already exists', 409));
    }

    return next(new AppError('Account created but profile setup failed. Please contact support.', 500));
  }
});

/**
 * Sign in user
 */
const signin = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email, password } = req.body;

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return next(new AppError('Invalid email or password', 401));
      }
      throw authError;
    }

    // Get user profile from our database using admin helper
    const userProfile = await supabaseHelpers.users.adminFindByAuthId(authData.user.id);
    
    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      return next(new AppError('Please verify your email before signing in', 401));
    }

    // Update last login
    await supabaseHelpers.users.update(userProfile.id, {
      last_login: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          id: userProfile.id,
          authId: userProfile.auth_id,
          email: userProfile.email,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          role: userProfile.role,
          isEmailVerified: userProfile.is_email_verified,
          isProfileComplete: userProfile.is_profile_complete
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    return next(new AppError('Failed to sign in', 500));
  }
});

/**
 * Sign out user
 */
const signout = catchAsync(async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Signout error:', error);
    return next(new AppError('Failed to sign out', 500));
  }
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token, type } = req.query;

  try {
    // Verify the email token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type || 'signup'
    });

    if (error) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    // Update user profile to mark email as verified
    const userProfile = await supabaseHelpers.users.adminFindByAuthId(data.user.id);
    if (userProfile) {
      await supabaseHelpers.users.adminUpdate(userProfile.id, {
        is_email_verified: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return next(new AppError('Failed to verify email', 500));
  }
});

/**
 * Forgot password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email } = req.body;

  try {
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return next(new AppError('Failed to send password reset email', 500));
  }
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { token, password } = req.body;

  try {
    // Reset password using token
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return next(new AppError('Failed to reset password', 500));
  }
});

/**
 * Refresh token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return next(new AppError('Invalid refresh token', 401));
    }

    res.status(200).json({
      success: true,
      data: {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return next(new AppError('Failed to refresh token', 500));
  }
});

/**
 * Get current user
 */
const getCurrentUser = catchAsync(async (req, res, next) => {
  try {
    const user = req.user; // Set by auth middleware

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return next(new AppError('Failed to get user information', 500));
  }
});

// Validation rules
const signupValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid SIT email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .notEmpty().withMessage('Password is required')
];

const signinValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

module.exports = {
  signup,
  signin,
  signout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser,
  signupValidation,
  signinValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
