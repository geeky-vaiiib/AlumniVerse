/**
 * Supabase Authentication Routes
 * Handles all authentication-related endpoints using Supabase Auth
 */

const express = require('express');
const {
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
} = require('../controllers/supabaseAuthController');

const {
  authenticateToken,
  authRateLimit,
  validateSITEmail
} = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user with SIT email
 * @access  Public
 */
router.post('/signup', 
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  validateSITEmail,
  signupValidation,
  signup
);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user
 * @access  Public
 */
router.post('/signin',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  signinValidation,
  signin
);

/**
 * @route   POST /api/auth/signout
 * @desc    Sign out user
 * @access  Private
 */
router.post('/signout', authenticateToken, signout);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password',
  authRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  forgotPasswordValidation,
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  resetPasswordValidation,
  resetPassword
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   GET /api/auth/health
 * @desc    Health check for auth service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Supabase Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
