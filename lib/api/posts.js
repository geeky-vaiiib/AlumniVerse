import { supabase } from '../supabaseClient'

/**
 * Fetch all posts with author information
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of posts to fetch
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.orderBy - Field to order by
 * @param {boolean} options.ascending - Sort order
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchPosts({ limit = 50, offset = 0, orderBy = 'created_at', ascending = false } = {}) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company,
          passing_year,
          is_profile_complete
        )
      `)
      .eq('is_deleted', false)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Transform data to match frontend format
    const transformedData = (data || []).map(post => ({
      id: post.id,
      author: {
        id: post.author?.id,
        name: `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim(),
        avatar: post.author?.avatar_path || null,
        title: post.author?.current_position || 'Alumni Member',
        company: post.author?.company || '',
        batch: post.author?.passing_year || '',
        isVerified: post.author?.is_profile_complete || false
      },
      content: post.content,
      type: post.post_type,
      images: post.images || [],
      links: post.links || [],
      tags: post.tags || [],
      timestamp: post.created_at,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      shares: post.shares_count || 0,
      isLiked: false, // Will be updated by checking user's likes
      isPinned: post.is_pinned || false
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { data: [], error }
  }
}

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.content - Post content
 * @param {string} postData.post_type - Post type
 * @param {Array} postData.images - Array of image URLs
 * @param {Array} postData.links - Array of links
 * @param {Array} postData.tags - Array of hashtags
 * @param {string} postData.author_id - Author's user ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createPost(postData) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author_id: postData.author_id,
        content: postData.content,
        post_type: postData.post_type || 'general',
        images: postData.images || [],
        links: postData.links || [],
        tags: postData.tags || [],
        visibility: postData.visibility || 'public'
      }])
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company,
          passing_year,
          is_profile_complete
        )
      `)
      .single()

    if (error) throw error

    // Transform to frontend format
    const transformedPost = {
      id: data.id,
      author: {
        id: data.author?.id,
        name: `${data.author?.first_name || ''} ${data.author?.last_name || ''}`.trim(),
        avatar: data.author?.avatar_path || null,
        title: data.author?.current_position || 'Alumni Member',
        company: data.author?.company || '',
        batch: data.author?.passing_year || '',
        isVerified: data.author?.is_profile_complete || false
      },
      content: data.content,
      type: data.post_type,
      images: data.images || [],
      links: data.links || [],
      tags: data.tags || [],
      timestamp: data.created_at,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isPinned: false
    }

    return { data: transformedPost, error: null }
  } catch (error) {
    console.error('Error creating post:', error)
    return { data: null, error }
  }
}

/**
 * Like or unlike a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null, isLiked: boolean}>}
 */
export async function togglePostLike(postId, userId) {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      return { data: { postId, userId }, error: null, isLiked: false }
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }])

      if (insertError) throw insertError
      return { data: { postId, userId }, error: null, isLiked: true }
    }
  } catch (error) {
    console.error('Error toggling post like:', error)
    return { data: null, error, isLiked: false }
  }
}

/**
 * Fetch comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchComments(postId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Transform to frontend format
    const transformedComments = (data || []).map(comment => ({
      id: comment.id,
      author: {
        id: comment.author?.id,
        name: `${comment.author?.first_name || ''} ${comment.author?.last_name || ''}`.trim(),
        avatar: comment.author?.avatar_path || null,
        title: comment.author?.current_position || 'Alumni Member',
        company: comment.author?.company || ''
      },
      content: comment.content,
      timestamp: comment.created_at,
      likes: comment.likes_count || 0,
      isLiked: false
    }))

    return { data: transformedComments, error: null }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { data: [], error }
  }
}

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {Object} commentData - Comment data
 * @param {string} commentData.author_id - Author's user ID
 * @param {string} commentData.content - Comment content
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function addComment(postId, commentData) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        author_id: commentData.author_id,
        content: commentData.content
      }])
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .single()

    if (error) throw error

    // Transform to frontend format
    const transformedComment = {
      id: data.id,
      author: {
        id: data.author?.id,
        name: `${data.author?.first_name || ''} ${data.author?.last_name || ''}`.trim(),
        avatar: data.author?.avatar_path || null,
        title: data.author?.current_position || 'Alumni Member',
        company: data.author?.company || ''
      },
      content: data.content,
      timestamp: data.created_at,
      likes: 0,
      isLiked: false
    }

    return { data: transformedComment, error: null }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { data: null, error }
  }
}

/**
 * Delete a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deletePost(postId, userId) {
  try {
    // Soft delete - just mark as deleted
    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', postId)
      .eq('author_id', userId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error }
  }
}

/**
 * Check if user has liked specific posts
 * @param {Array<string>} postIds - Array of post IDs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export async function checkUserLikes(postIds, userId) {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', userId)

    if (error) throw error

    // Create a map of liked posts
    const likedPosts = {}
    ;(data || []).forEach(like => {
      likedPosts[like.post_id] = true
    })

    return { data: likedPosts, error: null }
  } catch (error) {
    console.error('Error checking user likes:', error)
    return { data: {}, error }
  }
}

