/**
 * Mock Posts Controller - Temporary solution until database tables are created
 */

// In-memory posts storage (temporary)
let mockPosts = [
  {
    id: '1',
    author_id: 'mock-user-1',
    content: 'Welcome to AlumniVerse! Excited to connect with fellow alumni.',
    post_type: 'general',
    images: [],
    tags: ['welcome', 'alumni'],
    visibility: 'public',
    is_deleted: false,
    likes_count: 5,
    comments_count: 2,
    shares_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: {
      id: 'mock-user-1',
      name: 'Sample User',
      designation: 'Software Engineer',
      company: 'Tech Corp',
      batch: '2023',
      avatar: null
    },
    isLiked: false
  }
];

let nextId = 2;

/**
 * Get all posts with pagination
 */
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type = 'all', author_id } = req.query;
    
    // For now, return mock posts
    const posts = mockPosts.map(post => ({
      ...post,
      timestamp: new Date(post.created_at).toLocaleString()
    }));

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalItems: posts.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

/**
 * Get single post by ID
 */
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = mockPosts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

/**
 * Create a new post
 */
const createPost = async (req, res, next) => {
  try {
    const { content, post_type = 'general', images = [], tags = [] } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Get user info from request (would normally come from auth middleware)
    const user = req.user || {
      id: 'current-user',
      firstName: 'Current',
      lastName: 'User'
    };

    const newPost = {
      id: String(nextId++),
      author_id: user.id,
      content: content.trim(),
      post_type,
      images,
      tags,
      visibility: 'public',
      is_deleted: false,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        designation: user.currentPosition || 'Alumni',
        company: user.company || 'Not specified',
        batch: user.passingYear || 'Not specified',
        avatar: user.avatarPath
      },
      isLiked: false
    };

    mockPosts.unshift(newPost); // Add to beginning

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: newPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

/**
 * Update a post
 */
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, post_type, images, tags } = req.body;

    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const post = mockPosts[postIndex];
    
    // Update fields
    if (content !== undefined) post.content = content;
    if (post_type !== undefined) post.post_type = post_type;
    if (images !== undefined) post.images = images;
    if (tags !== undefined) post.tags = tags;
    post.updated_at = new Date().toISOString();

    mockPosts[postIndex] = post;

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

/**
 * Delete a post
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    mockPosts[postIndex].is_deleted = true;

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

/**
 * Like/Unlike a post
 */
const togglePostLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const post = mockPosts[postIndex];
    const isLiked = !post.isLiked;
    
    post.isLiked = isLiked;
    post.likes_count += isLiked ? 1 : -1;
    
    mockPosts[postIndex] = post;

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post liked successfully' : 'Post unliked successfully',
      data: {
        isLiked,
        likesCount: post.likes_count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

/**
 * Validation middleware for creating posts
 */
const createPostValidation = [
  // Add validation here if needed
];

/**
 * Validation middleware for updating posts
 */
const updatePostValidation = [
  // Add validation here if needed
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
