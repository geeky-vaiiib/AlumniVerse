const jwt = require('jsonwebtoken');

/**
 * JWT Token Utilities
 * Handles token generation, verification, and refresh
 */

class TokenUtils {
  /**
   * Generate access token
   * @param {Object} payload - User data to encode in token
   * @returns {String} JWT access token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'alumniverse-api',
        audience: 'alumniverse-client'
      }
    );
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to encode in token
   * @returns {String} JWT refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
        issuer: 'alumniverse-api',
        audience: 'alumniverse-client'
      }
    );
  }

  /**
   * Verify access token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'alumniverse-api',
        audience: 'alumniverse-client'
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - JWT refresh token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'alumniverse-api',
        audience: 'alumniverse-client'
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing both tokens
   */
  static generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: process.env.JWT_EXPIRE || '7d'
    };
  }

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header value
   * @returns {String|null} Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generate OTP
   * @returns {String} 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate password reset token
   * @param {String} email - User email
   * @returns {String} Reset token
   */
  static generateResetToken(email) {
    const payload = {
      email,
      type: 'password_reset',
      timestamp: Date.now()
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'alumniverse-api'
    });
  }

  /**
   * Verify password reset token
   * @param {String} token - Reset token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyResetToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'alumniverse-api'
      });
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}

module.exports = TokenUtils;
