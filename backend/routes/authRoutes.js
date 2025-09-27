const express = require('express');
const {
  signup,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  signupValidation,
  loginValidation
} = require('../controllers/authController');

const router = express.Router();

/**
 * Authentication Routes
 * All routes are public (no authentication required)
 */

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   POST /api/auth/otp
// @desc    Verify OTP for email verification
// @access  Public
router.post('/otp', verifyOTP);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', refreshToken);

module.exports = router;
