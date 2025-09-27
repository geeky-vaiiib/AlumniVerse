const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const TokenUtils = require('../utils/token');
const { dbHelpers } = require('../config/db');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Authentication Controller - Updated for PostgreSQL
 * Handles user registration, login, OTP verification, and password reset
 */

/**
 * User Registration
 */
const signup = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await dbHelpers.users.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User with this email already exists', 409));
  }

  // Validate email domain (must be @sit.ac.in)
  if (!email.endsWith('@sit.ac.in')) {
    return next(new AppError('Only @sit.ac.in email addresses are allowed', 400));
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    passwordHash,
    skills: [],
    experience: [],
    education: [],
    socialLinks: {},
    careerPreferences: {}
  };

  const user = await dbHelpers.users.create(userData);

  // Generate OTP for email verification
  const otp = TokenUtils.generateOTP();
  await dbHelpers.query(`
    INSERT INTO otp_verifications (email, otp, purpose, expires_at)
    VALUES ($1, $2, $3, $4)
  `, [email, otp, 'email_verification', new Date(Date.now() + 10 * 60 * 1000)]);

  // Generate tokens
  const tokens = TokenUtils.generateTokenPair(user);

  // Remove password from response
  const { password_hash, ...userResponse } = user;

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email with the OTP sent.',
    data: {
      user: userResponse,
      ...tokens,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only show OTP in development
    }
  });
});

/**
 * User Login
 */
const login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email, password } = req.body;

  // Find user
  const user = await dbHelpers.users.findByEmail(email);
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  await dbHelpers.users.update(user.id, { lastLogin: new Date() });

  // Generate tokens
  const tokens = TokenUtils.generateTokenPair(user);

  // Remove password from response
  const { password_hash, ...userResponse } = user;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      ...tokens
    }
  });
});

/**
 * OTP Verification
 */
const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Email and OTP are required', 400));
  }

  // Check OTP
  const otpResult = await dbHelpers.query(`
    SELECT * FROM otp_verifications 
    WHERE email = $1 AND otp = $2 AND purpose = 'email_verification' 
    AND expires_at > NOW() AND is_used = FALSE
    ORDER BY created_at DESC LIMIT 1
  `, [email, otp]);

  if (otpResult.rows.length === 0) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // Mark OTP as used
  await dbHelpers.query(`
    UPDATE otp_verifications SET is_used = TRUE WHERE id = $1
  `, [otpResult.rows[0].id]);

  // Mark email as verified
  const user = await dbHelpers.users.findByEmail(email);
  if (user) {
    await dbHelpers.users.update(user.id, { isEmailVerified: true });
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * Forgot Password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  // Find user
  const user = await dbHelpers.users.findByEmail(email);
  if (!user) {
    return next(new AppError('User with this email does not exist', 404));
  }

  // Generate reset token
  const resetToken = TokenUtils.generateResetToken(email);
  
  // Store reset token in database
  await dbHelpers.query(`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
  `, [user.id, resetToken, new Date(Date.now() + 60 * 60 * 1000)]); // 1 hour

  // In a real application, you would send this via email
  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
    data: {
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    }
  });
});

/**
 * Reset Password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return next(new AppError('Reset token and new password are required', 400));
  }

  // Verify reset token
  let decoded;
  try {
    decoded = TokenUtils.verifyResetToken(token);
  } catch (error) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Check if token exists in database and is not used
  const tokenResult = await dbHelpers.query(`
    SELECT prt.*, u.id as user_id FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.is_used = FALSE
    AND u.email = $2
  `, [token, decoded.email]);

  if (tokenResult.rows.length === 0) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  const tokenData = tokenResult.rows[0];

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update user password and mark token as used
  await dbHelpers.transaction(async (client) => {
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, tokenData.user_id]
    );
    
    await client.query(
      'UPDATE password_reset_tokens SET is_used = TRUE WHERE id = $1',
      [tokenData.id]
    );
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

/**
 * Refresh Token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = TokenUtils.verifyRefreshToken(refreshToken);
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Find user
  const user = await dbHelpers.users.findById(decoded.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if refresh token exists in database and is not revoked
  const tokenResult = await dbHelpers.query(`
    SELECT * FROM refresh_tokens 
    WHERE user_id = $1 AND token = $2 AND expires_at > NOW() AND is_revoked = FALSE
  `, [user.id, refreshToken]);

  if (tokenResult.rows.length === 0) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Generate new tokens
  const tokens = TokenUtils.generateTokenPair(user);

  // Store new refresh token and revoke old one
  await dbHelpers.transaction(async (client) => {
    await client.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1',
      [tokenResult.rows[0].id]
    );
    
    await client.query(`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, tokens.refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens
  });
});

// Validation rules
const signupValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  signup,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  signupValidation,
  loginValidation
};
