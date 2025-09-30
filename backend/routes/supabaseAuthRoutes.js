/**
 * Supabase Authentication Routes
 * Handles all authentication-related endpoints using Supabase Auth
 */

const express = require('express');
const {
  signup,
  signin,
  verifyOTP,
  signupValidation,
  signinValidation,
  verifyOTPValidation
} = require('../controllers/supabaseAuthController');

const {
  authenticateToken,
  authRateLimit,
  signupRateLimit,
  otpRateLimit,
  signinRateLimit,
  resendOtpRateLimit,
  validateSITEmail
} = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user with SIT email
 * @access  Public
 */
router.post('/signup',
  signupRateLimit, // 3 attempts per 5 minutes
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
  signinRateLimit, // 10 attempts per 15 minutes
  signinValidation,
  signin
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for email verification
 * @access  Public
 */
router.post('/verify-otp',
  otpRateLimit, // 5 attempts per 10 minutes
  verifyOTPValidation,
  verifyOTP
);

// Resend OTP is handled by frontend calling signup/signin again
// Signout is handled by frontend directly with Supabase client

// All other auth operations (password reset, refresh token, etc.)
// are handled directly by Supabase client on frontend

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
