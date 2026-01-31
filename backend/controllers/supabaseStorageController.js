const logger = require('../utils/logger');
/**
 * Supabase Storage Controller
 * Handles file uploads to Supabase Storage buckets
 */

const { supabase, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images (JPG, PNG, WebP) and documents (PDF, DOC, DOCX) are allowed.', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * Upload avatar image
 */
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const userId = req.user.id;
  const file = req.file;
  
  // Generate unique filename
  const fileExt = path.extname(file.originalname);
  const fileName = `${userId}/avatar_${Date.now()}${fileExt}`;

  try {
    // Delete existing avatar if exists
    const existingUser = await supabaseHelpers.users.findById(userId);
    if (existingUser.avatar_path) {
      try {
        await supabaseHelpers.storage.deleteFile('avatars', existingUser.avatar_path);
      } catch (deleteError) {
        logger.debug('Could not delete existing avatar:', deleteError.message);
      }
    }

    // Upload new avatar
    const uploadResult = await supabaseHelpers.storage.uploadFile('avatars', fileName, file.buffer);
    
    // Get public URL
    const publicUrl = supabaseHelpers.storage.getPublicUrl('avatars', fileName);

    // Update user profile with new avatar path
    await supabaseHelpers.users.update(userId, {
      avatar_path: fileName
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        fileName,
        publicUrl,
        size: file.size
      }
    });

  } catch (error) {
    logger.error('Avatar upload error:', error);
    return next(new AppError('Failed to upload avatar', 500));
  }
});

/**
 * Upload resume document
 */
const uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const userId = req.user.id;
  const file = req.file;
  
  // Generate unique filename
  const fileExt = path.extname(file.originalname);
  const fileName = `${userId}/resume_${Date.now()}${fileExt}`;

  try {
    // Delete existing resume if exists
    const existingUser = await supabaseHelpers.users.findById(userId);
    if (existingUser.resume_path) {
      try {
        await supabaseHelpers.storage.deleteFile('resumes', existingUser.resume_path);
      } catch (deleteError) {
        logger.debug('Could not delete existing resume:', deleteError.message);
      }
    }

    // Upload new resume
    const uploadResult = await supabaseHelpers.storage.uploadFile('resumes', fileName, file.buffer);
    
    // Update user profile with new resume path
    await supabaseHelpers.users.update(userId, {
      resume_path: fileName
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileName,
        size: file.size
      }
    });

  } catch (error) {
    logger.error('Resume upload error:', error);
    return next(new AppError('Failed to upload resume', 500));
  }
});

/**
 * Get signed URL for resume download
 */
const getResumeUrl = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  // Check if user can access this resume
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  try {
    const user = await supabaseHelpers.users.findById(userId);
    
    if (!user || !user.resume_path) {
      return next(new AppError('Resume not found', 404));
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await supabaseHelpers.storage.createSignedUrl('resumes', user.resume_path, 3600);

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: 3600
      }
    });

  } catch (error) {
    logger.error('Resume URL generation error:', error);
    return next(new AppError('Failed to generate download URL', 500));
  }
});

/**
 * Delete avatar
 */
const deleteAvatar = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await supabaseHelpers.users.findById(userId);
    
    if (!user.avatar_path) {
      return next(new AppError('No avatar to delete', 404));
    }

    // Delete from storage
    await supabaseHelpers.storage.deleteFile('avatars', user.avatar_path);

    // Update user profile
    await supabaseHelpers.users.update(userId, {
      avatar_path: null
    });

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    logger.error('Avatar deletion error:', error);
    return next(new AppError('Failed to delete avatar', 500));
  }
});

/**
 * Delete resume
 */
const deleteResume = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await supabaseHelpers.users.findById(userId);
    
    if (!user.resume_path) {
      return next(new AppError('No resume to delete', 404));
    }

    // Delete from storage
    await supabaseHelpers.storage.deleteFile('resumes', user.resume_path);

    // Update user profile
    await supabaseHelpers.users.update(userId, {
      resume_path: null
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    logger.error('Resume deletion error:', error);
    return next(new AppError('Failed to delete resume', 500));
  }
});

/**
 * Get file upload limits and allowed types
 */
const getUploadInfo = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      limits: {
        maxFileSize: '10MB',
        maxFileSizeBytes: 10 * 1024 * 1024
      },
      allowedTypes: {
        avatar: {
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          extensions: ['.jpg', '.jpeg', '.png', '.webp'],
          maxSize: '5MB'
        },
        resume: {
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          extensions: ['.pdf', '.doc', '.docx'],
          maxSize: '10MB'
        }
      }
    }
  });
};

// Multer middleware configurations
const uploadAvatarMiddleware = upload.single('avatar');
const uploadResumeMiddleware = upload.single('resume');

module.exports = {
  uploadAvatar,
  uploadResume,
  getResumeUrl,
  deleteAvatar,
  deleteResume,
  getUploadInfo,
  uploadAvatarMiddleware,
  uploadResumeMiddleware
};
