const express = require('express');
const {
  getAlumniDirectory,
  getAlumniById,
  getAlumniStats,
  getFeaturedAlumni,
  directoryValidation
} = require('../controllers/directoryController');
const { authenticateToken, optionalAuth } = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * Directory Routes
 * Some routes are public, others require authentication
 */

// @route   GET /api/directory
// @desc    Get alumni directory with filters and search
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, directoryValidation, getAlumniDirectory);

// @route   GET /api/directory/stats
// @desc    Get alumni statistics
// @access  Public (with optional auth for personalization)
router.get('/stats', optionalAuth, getAlumniStats);

// @route   GET /api/directory/featured
// @desc    Get featured alumni
// @access  Public (with optional auth for personalization)
router.get('/featured', optionalAuth, getFeaturedAlumni);

// @route   GET /api/directory/:id
// @desc    Get single alumni details
// @access  Public (with optional auth for personalization)
router.get('/:id', optionalAuth, getAlumniById);

module.exports = router;
