const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  uploadFiles,
  getCurrentUser,
  deleteUser,
  updateProfileValidation
} = require('../controllers/userController');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middlewares/authMiddleware');
const { uploadFields } = require('../middlewares/uploadMiddleware');

const router = express.Router();

/**
 * User Routes
 * All routes require authentication
 */

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getCurrentUser);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', authenticateToken, getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile or admin)
router.put('/:id', 
  authenticateToken, 
  requireOwnershipOrAdmin, 
  updateProfileValidation, 
  updateUserProfile
);

// @route   POST /api/users/upload
// @desc    Upload profile picture and/or resume
// @access  Private
router.post('/upload', 
  authenticateToken,
  uploadFields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  uploadFiles
);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (own profile or admin)
router.delete('/:id', 
  authenticateToken, 
  requireOwnershipOrAdmin, 
  deleteUser
);

module.exports = router;
