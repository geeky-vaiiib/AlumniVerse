const TokenUtils = require('../utils/token');
const { dbHelpers } = require('../config/db');

/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = TokenUtils.verifyAccessToken(token);
    
    // Find user in database
    const user = await dbHelpers.users.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
};

/**
 * Check if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = TokenUtils.verifyAccessToken(token);
      const user = await dbHelpers.users.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'user'
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 */
const requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.id || req.params.userId;
  const currentUserId = req.user.id;
  const userRole = req.user.role || 'user';

  if (currentUserId === resourceUserId || userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You can only access your own resources'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  requireOwnershipOrAdmin
};
