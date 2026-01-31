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
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register new user with SIT email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 1si23cs117@sit.ac.in
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid SIT email
 *       409:
 *         description: Email already registered
 */
router.post('/signup',
  signupRateLimit,
  validateSITEmail,
  signupValidation,
  signup
);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 1si23cs117@sit.ac.in
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post('/signin',
  signinRateLimit,
  signinValidation,
  signin
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP for authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 session:
 *                   type: object
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp',
  otpRateLimit,
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
