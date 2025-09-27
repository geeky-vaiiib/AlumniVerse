const { body, validationResult } = require('express-validator');
const { supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');
const { getFileUrl, deleteFile } = require('../middlewares/uploadMiddleware');

/**
 * User Controller
 * Handles user profile operations
 */

/**
 * Get user profile by ID
 */
const getUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await supabaseHelpers.users.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Remove sensitive information
  const { password_hash, ...userProfile } = user;

  // Add file URLs if files exist
  if (userProfile.profile_picture) {
    userProfile.profilePictureUrl = getFileUrl(req, userProfile.profile_picture);
  }
  if (userProfile.resume) {
    userProfile.resumeUrl = getFileUrl(req, userProfile.resume);
  }

  res.status(200).json({
    success: true,
    data: {
      user: userProfile
    }
  });
});

/**
 * Update user profile
 */
const updateUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  // Check if user exists
  const user = await supabaseHelpers.users.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const {
    firstName,
    lastName,
    bio,
    skills,
    experience,
    education,
    socialLinks,
    branch,
    graduationYear,
    currentPosition,
    company,
    location,
    phone
  } = req.body;

  // Prepare update data
  const updateData = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (bio !== undefined) updateData.bio = bio;
  if (branch) updateData.branch = branch;
  if (graduationYear) updateData.graduationYear = parseInt(graduationYear);
  if (currentPosition) updateData.currentPosition = currentPosition;
  if (company) updateData.company = company;
  if (location) updateData.location = location;
  if (phone) updateData.phone = phone;

  // Handle array/object fields
  if (skills) {
    updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  }
  if (experience) {
    updateData.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
  }
  if (education) {
    updateData.education = Array.isArray(education) ? education : JSON.parse(education);
  }
  if (socialLinks) {
    updateData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
  }

  // Update user
  const updatedUser = await supabaseHelpers.users.update(id, updateData);

  // Remove password from response
  const { password_hash, ...userResponse } = updatedUser;

  // Add file URLs
  if (userResponse.profile_picture) {
    userResponse.profilePictureUrl = getFileUrl(req, userResponse.profile_picture);
  }
  if (userResponse.resume) {
    userResponse.resumeUrl = getFileUrl(req, userResponse.resume);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userResponse
    }
  });
});

/**
 * Upload files (profile picture or resume)
 */
const uploadFiles = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await supabaseHelpers.users.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const updateData = {};
  const uploadedFiles = {};

  // Handle profile picture
  if (req.files?.profilePicture) {
    const profilePicture = req.files.profilePicture[0];

    // Delete old profile picture if exists
    if (user.profile_picture) {
      try {
        await deleteFile(user.profile_picture);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }
    
    updateData.profilePicture = profilePicture.path;
    uploadedFiles.profilePicture = {
      filename: profilePicture.filename,
      originalName: profilePicture.originalname,
      size: profilePicture.size,
      url: getFileUrl(req, profilePicture.path)
    };
  }

  // Handle resume
  if (req.files?.resume) {
    const resume = req.files.resume[0];

    // Delete old resume if exists
    if (user.resume) {
      try {
        await deleteFile(user.resume);
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    updateData.resume = resume.path;
    uploadedFiles.resume = {
      filename: resume.filename,
      originalName: resume.originalname,
      size: resume.size,
      url: getFileUrl(req, resume.path)
    };
  }

  // Handle single file upload
  if (req.file) {
    const file = req.file;
    const fieldName = file.fieldname;

    // Delete old file if exists
    const oldFilePath = fieldName === 'profilePicture' ? user.profile_picture : user.resume;
    if (oldFilePath) {
      try {
        await deleteFile(oldFilePath);
      } catch (error) {
        console.error(`Error deleting old ${fieldName}:`, error);
      }
    }

    updateData[fieldName === 'profilePicture' ? 'profilePicture' : 'resume'] = file.path;
    uploadedFiles[fieldName] = {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: getFileUrl(req, file.path)
    };
  }

  if (Object.keys(uploadedFiles).length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  // Update user profile
  const updatedUser = await supabaseHelpers.users.update(userId, updateData);

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    data: {
      uploadedFiles
    }
  });
});

/**
 * Get current user profile (from token)
 */
const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await supabaseHelpers.users.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Remove password from response
  const { password_hash, ...userProfile } = user;

  // Add file URLs
  if (userProfile.profile_picture) {
    userProfile.profilePictureUrl = getFileUrl(req, userProfile.profile_picture);
  }
  if (userProfile.resume) {
    userProfile.resumeUrl = getFileUrl(req, userProfile.resume);
  }

  res.status(200).json({
    success: true,
    data: {
      user: userProfile
    }
  });
});

/**
 * Delete user account
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await supabaseHelpers.users.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Delete user files
  if (user.profile_picture) {
    try {
      await deleteFile(user.profile_picture);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    }
  }

  if (user.resume) {
    try {
      await deleteFile(user.resume);
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  }

  // Mark the user as deleted (soft delete)
  await supabaseHelpers.users.delete(id);

  res.status(200).json({
    success: true,
    message: 'User account deleted successfully'
  });
});

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year'),
  body('phone').optional().matches(/^[+]?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format')
];

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadFiles,
  getCurrentUser,
  deleteUser,
  updateProfileValidation
};
