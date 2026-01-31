const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Posts Controller
 * Handles social media posts operations
 */

/**
 * Get all posts with pagination
 */
const getPosts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type = 'all', author_id } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        first_name,
        last_name,
        current_position,
        company,
        passing_year,
        avatar_path
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type !== 'all') {
    query = query.eq('post_type', type);
  }

  if (author_id) {
    query = query.eq('author_id', author_id);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    logger.error('Supabase error fetching posts:', error);
    return next(new AppError(`Failed to fetch posts: ${error.message}`, 500));
  }

  // Process posts to include like status for current user (if logged in)
  const userId = req.user?.id;
  const postsWithLikeStatus = await Promise.all(
    posts.map(async (post) => {
      let userLike = null;
      
      // Only check like status if user is logged in
      if (userId) {
        const { data } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .single();
        userLike = data;
      }

      return {
        ...post,
        isLiked: !!userLike,
        likes: post.likes_count || 0,
        commentsCount: post.comments_count || 0,
        author: post.author ? {
          id: post.author.id,
          name: `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim(),
          designation: post.author.current_position || 'Alumni',
          company: post.author.company || 'Not specified',
          batch: post.author.passing_year || 'Not specified',
          avatar: post.author.avatar_path
        } : null
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * Get single post by ID
 */
const getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        first_name,
        last_name,
        current_position,
        company,
        passing_year,
        avatar_path
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error || !post) {
    return next(new AppError('Post not found', 404));
  }

  // Check if current user liked the post (if logged in)
  let userLike = null;
  if (req.user?.id) {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', req.user.id)
      .single();
    userLike = data;
  }

  const postWithDetails = {
    ...post,
    isLiked: !!userLike,
    author: {
      id: post.author.id,
      name: `${post.author.first_name} ${post.author.last_name}`,
      designation: post.author.current_position || 'Alumni',
      company: post.author.company || 'Not specified',
      batch: post.author.passing_year || 'Not specified',
      avatar: post.author.avatar_path
    }
  };

  res.status(200).json({
    success: true,
    data: {
      post: postWithDetails
    }
  });
});

/**
 * Create a new post
 */
const createPost = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { content, post_type = 'general', images = [], tags = [] } = req.body;
  const author_id = req.user.id;

  const { data: post, error } = await supabase
    .from('posts')
    .insert([{
      author_id,
      content,
      post_type,
      images,
      tags
    }])
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        first_name,
        last_name,
        current_position,
        company,
        passing_year,
        avatar_path
      )
    `)
    .single();

  if (error) {
    return next(new AppError('Failed to create post', 500));
  }

  const newPost = {
    ...post,
    isLiked: false,
    likes: 0,
    comments: 0,
    author: {
      id: post.author.id,
      name: `${post.author.first_name} ${post.author.last_name}`,
      designation: post.author.current_position || 'Alumni',
      company: post.author.company || 'Not specified',
      batch: post.author.passing_year || 'Not specified',
      avatar: post.author.avatar_path
    }
  };

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: {
      post: newPost
    }
  });
});

/**
 * Update a post
 */
const updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content, post_type, images, tags } = req.body;

  // Check if post exists and belongs to current user
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (fetchError || !existingPost) {
    return next(new AppError('Post not found', 404));
  }

  if (existingPost.author_id !== req.user.id) {
    return next(new AppError('You can only update your own posts', 403));
  }

  const updateData = {};
  if (content !== undefined) updateData.content = content;
  if (post_type !== undefined) updateData.post_type = post_type;
  if (images !== undefined) updateData.images = images;
  if (tags !== undefined) updateData.tags = tags;

  const { data: post, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        first_name,
        last_name,
        current_position,
        company,
        passing_year,
        avatar_path
      )
    `)
    .single();

  if (error) {
    return next(new AppError('Failed to update post', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: {
      post
    }
  });
});

/**
 * Delete a post
 */
const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if post exists and belongs to current user
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (fetchError || !existingPost) {
    return next(new AppError('Post not found', 404));
  }

  if (existingPost.author_id !== req.user.id) {
    return next(new AppError('You can only delete your own posts', 403));
  }

  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    return next(new AppError('Failed to delete post', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

/**
 * Like/Unlike a post
 */
const togglePostLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if post exists
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (postError || !post) {
    return next(new AppError('Post not found', 404));
  }

  // Check if user already liked the post
  const { data: existingLike, error: likeError } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', userId)
    .single();

  let isLiked;

  if (existingLike) {
    // Unlike the post
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      return next(new AppError('Failed to unlike post', 500));
    }
    isLiked = false;
  } else {
    // Like the post
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert([{ post_id: id, user_id: userId }]);

    if (insertError) {
      return next(new AppError('Failed to like post', 500));
    }
    isLiked = true;
  }

  // Get updated like count
  const { data: likeCount } = await supabase
    .from('post_likes')
    .select('id', { count: 'exact' })
    .eq('post_id', id);

  res.status(200).json({
    success: true,
    message: isLiked ? 'Post liked successfully' : 'Post unliked successfully',
    data: {
      isLiked,
      likesCount: likeCount.length
    }
  });
});

/**
 * Validation middleware for creating posts
 */
const createPostValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('post_type')
    .optional()
    .isIn(['general', 'achievement', 'question', 'announcement', 'job', 'event'])
    .withMessage('Invalid post type'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

/**
 * Validation middleware for updating posts
 */
const updatePostValidation = [
  body('content')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('post_type')
    .optional()
    .isIn(['general', 'achievement', 'question', 'announcement', 'job', 'event'])
    .withMessage('Invalid post type'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  createPostValidation,
  updatePostValidation
};
