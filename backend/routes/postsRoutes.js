const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  createPostValidation,
  updatePostValidation
} = require('../controllers/postsController'); // Using real Supabase controller
const { authenticateToken, optionalAuth } = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * Posts Routes
 * GET routes use optional auth (public + personalized if logged in)
 * POST/PUT/DELETE routes require authentication
 */

// @route   GET /api/posts
// @desc    Get all posts with pagination and filtering
// @access  Public (optionally authenticated for personalization)
router.get('/', optionalAuth, getPosts);

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public (optionally authenticated)
router.get('/:id', optionalAuth, getPost);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateToken, createPostValidation, createPost);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (own post only)
router.put('/:id', authenticateToken, updatePostValidation, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (own post only)
router.delete('/:id', authenticateToken, deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', authenticateToken, togglePostLike);

module.exports = router;
