const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  eventValidation,
  eventQueryValidation
} = require('../controllers/eventsController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Events Routes
 * Mix of public and private routes
 */

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, eventQueryValidation, getEvents);

// @route   GET /api/events/my
// @desc    Get events organized by current user
// @access  Private
router.get('/my', authenticateToken, getMyEvents);

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public (with optional auth for registration status)
router.get('/:id', optionalAuth, getEventById);

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', authenticateToken, eventValidation, createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (own events only)
router.put('/:id', authenticateToken, eventValidation, updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (own events only)
router.delete('/:id', authenticateToken, deleteEvent);

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', authenticateToken, registerForEvent);

// @route   DELETE /api/events/:id/register
// @desc    Unregister from event
// @access  Private
router.delete('/:id/register', authenticateToken, unregisterFromEvent);

module.exports = router;
