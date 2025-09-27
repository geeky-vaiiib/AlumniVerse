/**
 * Supabase Storage Routes
 * Handles file upload and management endpoints
 */

const express = require('express');
const {
  uploadAvatar,
  uploadResume,
  getResumeUrl,
  deleteAvatar,
  deleteResume,
  getUploadInfo,
  uploadAvatarMiddleware,
  uploadResumeMiddleware
} = require('../controllers/supabaseStorageController');

const {
  authenticateToken,
  requireEmailVerification
} = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * @route   POST /api/storage/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar',
  authenticateToken,
  requireEmailVerification,
  uploadAvatarMiddleware,
  uploadAvatar
);

/**
 * @route   DELETE /api/storage/avatar
 * @desc    Delete user avatar
 * @access  Private
 */
router.delete('/avatar',
  authenticateToken,
  requireEmailVerification,
  deleteAvatar
);

/**
 * @route   POST /api/storage/resume
 * @desc    Upload user resume
 * @access  Private
 */
router.post('/resume',
  authenticateToken,
  requireEmailVerification,
  uploadResumeMiddleware,
  uploadResume
);

/**
 * @route   DELETE /api/storage/resume
 * @desc    Delete user resume
 * @access  Private
 */
router.delete('/resume',
  authenticateToken,
  requireEmailVerification,
  deleteResume
);

/**
 * @route   GET /api/storage/resume/:userId
 * @desc    Get signed URL for resume download
 * @access  Private
 */
router.get('/resume/:userId',
  authenticateToken,
  requireEmailVerification,
  getResumeUrl
);

/**
 * @route   GET /api/storage/info
 * @desc    Get upload limits and allowed file types
 * @access  Public
 */
router.get('/info', getUploadInfo);

module.exports = router;
