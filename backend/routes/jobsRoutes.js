const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  jobValidation,
  jobQueryValidation,
  applicationStatusValidation
} = require('../controllers/jobsController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Jobs Routes
 * Mix of public and private routes
 */

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, jobQueryValidation, getJobs);

// @route   GET /api/jobs/my
// @desc    Get jobs posted by current user
// @access  Private
router.get('/my', authenticateToken, getMyJobs);

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public (with optional auth for personalization)
router.get('/:id', optionalAuth, getJobById);

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private
router.post('/', authenticateToken, jobValidation, createJob);

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (own jobs only)
router.put('/:id', authenticateToken, jobValidation, updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (own jobs only)
router.delete('/:id', authenticateToken, deleteJob);

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private
router.post('/:id/apply', authenticateToken, applyToJob);

// @route   GET /api/jobs/:id/applications
// @desc    Get applications for a job (job owner or admin only)
// @access  Private
router.get('/:id/applications', authenticateToken, getJobApplications);

// @route   PUT /api/jobs/:jobId/applications/:applicationId
// @desc    Update application status (job owner or admin only)
// @access  Private
router.put('/:jobId/applications/:applicationId', authenticateToken, applicationStatusValidation, updateApplicationStatus);

module.exports = router;
