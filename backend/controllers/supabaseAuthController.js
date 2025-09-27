/**
 * Supabase Authentication Controller
 * Handles authentication using Supabase Auth with SIT email validation
 */

const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Sign up new user with SIT email validation
 */
const signup = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { firstName, lastName, email, password, usn, branch, admissionYear, passingYear } = req.body;

  // Validate SIT email domain
  if (!email.endsWith('@sit.ac.in')) {
    return next(new AppError('Only SIT email addresses are allowed', 400));
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll handle email confirmation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        usn,
        branch,
        admission_year: admissionYear,
        passing_year: passingYear
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return next(new AppError('User with this email already exists', 409));
      }
      throw authError;
    }

    // Create user profile in our users table
    const userProfile = {
      auth_id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      usn,
      branch,
      admission_year: admissionYear,
      passing_year: passingYear,
      is_email_verified: false,
      role: 'user'
    };

    const createdUser = await supabaseHelpers.users.create(userProfile);

    // Send email verification
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    if (emailError) {
      console.error('Email verification error:', emailError);
      // Don't fail the signup if email sending fails
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification link.',
      data: {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.first_name,
          lastName: createdUser.last_name,
          isEmailVerified: createdUser.is_email_verified
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return next(new AppError('Failed to create account', 500));
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

    // Get user profile from our database
    const userProfile = await supabaseHelpers.users.findByAuthId(authData.user.id);
    
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
    const userProfile = await supabaseHelpers.users.findByAuthId(data.user.id);
    if (userProfile) {
      await supabaseHelpers.users.update(userProfile.id, {
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
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('usn').optional().trim().isLength({ min: 3, max: 20 }).withMessage('USN must be 3-20 characters'),
  body('branch').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Branch must be 2-100 characters'),
  body('admissionYear').optional().isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid admission year'),
  body('passingYear').optional().isInt({ min: 2000, max: new Date().getFullYear() + 10 }).withMessage('Invalid passing year')
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
