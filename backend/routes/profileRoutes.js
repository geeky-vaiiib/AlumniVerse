/**
 * Enhanced Profile Routes for AlumniVerse
 * Handles profile creation, updates, and resume uploads
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { supabaseAdmin } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');
const { authenticateToken } = require('../middlewares/supabaseAuthMiddleware');

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${userId}_${timestamp}_${name}${ext}`);
  }
});

// File filter for resume uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and DOCX files are allowed for resume upload', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// URL validation patterns
const urlPatterns = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
  github: /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/,
  leetcode: /^https?:\/\/(www\.)?leetcode\.com\/[A-Za-z0-9_-]+\/?$/
};

// Validation middleware for profile update
const profileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('branch')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch must be between 2 and 100 characters'),
  
  body('yearOfPassing')
    .optional()
    .isInt({ min: 2010, max: 2030 })
    .withMessage('Year of passing must be between 2010 and 2030'),
  
  body('currentCompany')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Designation must not exceed 200 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('linkedinUrl')
    .optional()
    .custom((value) => {
      if (value && !urlPatterns.linkedin.test(value)) {
        throw new Error('Invalid LinkedIn URL format');
      }
      return true;
    }),
  
  body('githubUrl')
    .optional()
    .custom((value) => {
      if (value && !urlPatterns.github.test(value)) {
        throw new Error('Invalid GitHub URL format');
      }
      return true;
    }),
  
  body('leetcodeUrl')
    .optional()
    .custom((value) => {
      if (value && !urlPatterns.leetcode.test(value)) {
        throw new Error('Invalid LeetCode URL format');
      }
      return true;
    })
];

/**
 * @route   POST /api/profile/upload-resume
 * @desc    Upload resume file
 * @access  Private
 */
router.post('/upload-resume', authenticateToken, upload.single('resume'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No resume file provided', 400));
  }

  // Generate resume URL
  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  
  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: {
      resumeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    }
  });
}));

/**
 * @route   PUT /api/profile/update
 * @desc    Update user profile with enhanced fields
 * @access  Private
 */
router.put('/update', authenticateToken, profileValidation, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const {
    firstName,
    lastName,
    branch,
    yearOfPassing,
    currentCompany,
    designation,
    location,
    linkedinUrl,
    githubUrl,
    leetcodeUrl,
    resumeUrl
  } = req.body;

  // Build update object with only provided fields
  const updateData = {};
  if (firstName !== undefined) updateData.first_name = firstName;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (branch !== undefined) updateData.branch = branch;
  if (yearOfPassing !== undefined) updateData.passing_year = yearOfPassing;
  if (currentCompany !== undefined) updateData.company = currentCompany;
  if (designation !== undefined) updateData.current_position = designation;
  if (location !== undefined) updateData.location = location;
  if (linkedinUrl !== undefined) updateData.linkedin_url = linkedinUrl;
  if (githubUrl !== undefined) updateData.github_url = githubUrl;
  if (leetcodeUrl !== undefined) updateData.leetcode_url = leetcodeUrl;
  if (resumeUrl !== undefined) updateData.resume_url = resumeUrl;

  // Check if profile is now complete
  const isProfileComplete = (
    (updateData.first_name || req.user.first_name) &&
    (updateData.last_name || req.user.last_name) &&
    (updateData.branch || req.user.branch) &&
    (updateData.passing_year || req.user.passing_year)
  );

  if (isProfileComplete) {
    updateData.is_profile_complete = true;
  }

  updateData.updated_at = new Date().toISOString();

  // Update user in database
  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('auth_id', req.user.authId)
    .select()
    .single();

  if (error) {
    console.error('Profile update error:', error);
    return next(new AppError('Failed to update profile', 500));
  }

  // Remove sensitive data from response
  const { password_hash, auth_id, ...userResponse } = updatedUser;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userResponse,
      isProfileComplete: updatedUser.is_profile_complete
    }
  });
}));

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's complete profile
 * @access  Private
 */
router.get('/me', authenticateToken, catchAsync(async (req, res, next) => {
  const userId = req.user?.authId;
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', userId)
    .single();

  if (error || !user) {
    return next(new AppError('User profile not found', 404));
  }

  // Remove sensitive data
  const { password_hash, auth_id, ...userProfile } = user;

  res.status(200).json({
    success: true,
    data: {
      user: userProfile
    }
  });
}));

module.exports = router;
