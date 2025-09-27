const express = require('express');
const {
  getUserBadges,
  getLeaderboard,
  awardBadge,
  getBadgeTypes,
  getBadgeStats,
  removeBadge,
  awardBadgeValidation,
  leaderboardValidation
} = require('../controllers/badgesController');
const { authenticateToken, requireRole, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Badges Routes
 * Mix of public and private routes
 */

// @route   GET /api/badges/types
// @desc    Get available badge types
// @access  Public
router.get('/types', getBadgeTypes);

// @route   GET /api/badges/stats
// @desc    Get badge statistics
// @access  Public
router.get('/stats', getBadgeStats);

// @route   GET /api/badges/leaderboard
// @desc    Get leaderboard
// @access  Public (with optional auth for personalization)
router.get('/leaderboard', optionalAuth, leaderboardValidation, getLeaderboard);

// @route   GET /api/badges/user/:userId?
// @desc    Get user badges (if no userId, get current user's badges)
// @access  Private
router.get('/user/:userId?', authenticateToken, getUserBadges);

// @route   POST /api/badges
// @desc    Award badge to user
// @access  Private (admin or moderator only)
router.post('/', authenticateToken, requireRole(['admin', 'moderator']), awardBadgeValidation, awardBadge);

// @route   DELETE /api/badges/:badgeId
// @desc    Remove badge from user
// @access  Private (admin or badge awarder only)
router.delete('/:badgeId', authenticateToken, removeBadge);

module.exports = router;
