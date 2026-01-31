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
const { authenticateToken, optionalAuth } = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with filters
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', optionalAuth, jobQueryValidation, getJobs);

/**
 * @swagger
 * /jobs/my:
 *   get:
 *     summary: Get jobs posted by current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's job postings
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticateToken, getMyJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/:id', optionalAuth, getJobById);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created
 *       401:
 *         description: Unauthorized
 */
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
