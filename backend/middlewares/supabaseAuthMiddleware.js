/**
 * Supabase Authentication Middleware
 * Handles JWT token verification using Supabase Auth
 */

const { supabase, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('./errorMiddleware');
const rateLimit = require('express-rate-limit');

/**
 * Verify Supabase JWT token and get user
 */
const authenticateToken = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access token is required', 401));
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // Get user profile from our database
    const userProfile = await supabaseHelpers.users.findByAuthId(user.id);

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    if (userProfile.is_deleted) {
      return next(new AppError('Account has been deactivated', 401));
    }

    // Attach user to request
    req.user = {
      id: userProfile.id,
      authId: userProfile.auth_id,
      email: userProfile.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      role: userProfile.role,
      isEmailVerified: userProfile.is_email_verified,
      isProfileComplete: userProfile.is_profile_complete,
      branch: userProfile.branch,
      passingYear: userProfile.passing_year
    };

    next();

  } catch (error) {
    console.error('Token verification error:', error);
    return next(new AppError('Invalid token', 401));
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      return next();
    }

    // Get user profile from our database
    const userProfile = await supabaseHelpers.users.findByAuthId(user.id);

    if (!userProfile || userProfile.is_deleted) {
      req.user = null;
      return next();
    }

    // Attach user to request
    req.user = {
      id: userProfile.id,
      authId: userProfile.auth_id,
      email: userProfile.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      role: userProfile.role,
      isEmailVerified: userProfile.is_email_verified,
      isProfileComplete: userProfile.is_profile_complete,
      branch: userProfile.branch,
      passingYear: userProfile.passing_year
    };

    next();

  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
});

/**
 * Require email verification
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isEmailVerified) {
    return next(new AppError('Email verification required', 403));
  }

  next();
};

/**
 * Require specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Require admin or moderator role
 */
const requireModerator = requireRole('admin', 'moderator');

/**
 * Check if user owns resource or is admin
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints using express-rate-limit
 */
const createAuthRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000, message = 'Too many requests') => {
  return rateLimit({
    windowMs: windowMs,
    max: maxAttempts,
    message: {
      success: false,
      error: {
        statusCode: 429,
        status: 'error',
        isOperational: true
      },
      message: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use IP + User-Agent for better identification
    keyGenerator: (req) => {
      return req.ip + ':' + (req.get('User-Agent') || 'unknown');
    },
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      console.log(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        error: {
          statusCode: 429,
          status: 'error',
          isOperational: true
        },
        message: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters for different endpoints
const signupRateLimit = createAuthRateLimit(
  3, // 3 attempts
  5 * 60 * 1000, // per 5 minutes (reduced from 15 minutes)
  'Too many signup attempts. Please try again in 5 minutes.'
);

const otpRateLimit = createAuthRateLimit(
  5, // 5 attempts
  10 * 60 * 1000, // per 10 minutes
  'Too many OTP requests. Please try again in 10 minutes.'
);

const signinRateLimit = createAuthRateLimit(
  10, // 10 attempts
  15 * 60 * 1000, // per 15 minutes
  'Too many login attempts. Please try again in 15 minutes.'
);

const resendOtpRateLimit = createAuthRateLimit(
  3, // 3 attempts
  10 * 60 * 1000, // per 10 minutes
  'Too many OTP resend requests. Please try again in 10 minutes.'
);

// Legacy function for backward compatibility
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return createAuthRateLimit(maxAttempts, windowMs);
};

/**
 * Validate SIT email domain
 */
const validateSITEmail = (req, res, next) => {
  const { email } = req.body;

  if (email && !email.endsWith('@sit.ac.in')) {
    return next(new AppError('Only SIT email addresses are allowed', 400));
  }

  next();
};

/**
 * Set Supabase session for request
 */
const setSupabaseSession = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    // Set the session for this request
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: req.headers['x-refresh-token'] || ''
    });
  }

  next();
});

module.exports = {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requireRole,
  requireAdmin,
  requireModerator,
  requireOwnershipOrAdmin,
  authRateLimit,
  signupRateLimit,
  otpRateLimit,
  signinRateLimit,
  resendOtpRateLimit,
  validateSITEmail,
  setSupabaseSession
};
