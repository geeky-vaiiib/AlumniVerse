import { supabase } from '../supabaseClient'

/**
 * Fetch all jobs with poster information
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of jobs to fetch
 * @param {number} options.offset - Offset for pagination
 * @param {boolean} options.activeOnly - Fetch only active jobs
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchJobs({ limit = 50, offset = 0, activeOnly = true } = {}) {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data to match frontend format
    const transformedData = (data || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      experienceLevel: job.experience_level,
      description: job.description,
      salaryRange: job.salary_range,
      requiredSkills: job.required_skills || [],
      applicationUrl: job.application_url,
      contactEmail: job.contact_email,
      deadline: job.deadline,
      postedBy: {
        id: job.posted_by_user?.id,
        name: `${job.posted_by_user?.first_name || ''} ${job.posted_by_user?.last_name || ''}`.trim(),
        avatar: job.posted_by_user?.avatar_path || null,
        position: job.posted_by_user?.current_position || '',
        company: job.posted_by_user?.company || ''
      },
      postedDate: job.created_at,
      isActive: job.is_active,
      isSaved: false // Will be updated by checking user's bookmarks
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return { data: [], error }
  }
}

/**
 * Create a new job posting
 * @param {Object} jobData - Job data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createJob(jobData) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type || 'job',
        experience_level: jobData.experienceLevel,
        salary_range: jobData.salaryRange,
        required_skills: jobData.requiredSkills || [],
        application_url: jobData.applicationUrl,
        contact_email: jobData.contactEmail,
        deadline: jobData.deadline,
        posted_by: jobData.postedBy
      }])
      .select(`
        *,
        posted_by_user:users!posted_by (
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
    const transformedJob = {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      experienceLevel: data.experience_level,
      description: data.description,
      salaryRange: data.salary_range,
      requiredSkills: data.required_skills || [],
      applicationUrl: data.application_url,
      contactEmail: data.contact_email,
      deadline: data.deadline,
      postedBy: {
        id: data.posted_by_user?.id,
        name: `${data.posted_by_user?.first_name || ''} ${data.posted_by_user?.last_name || ''}`.trim(),
        avatar: data.posted_by_user?.avatar_path || null,
        position: data.posted_by_user?.current_position || '',
        company: data.posted_by_user?.company || ''
      },
      postedDate: data.created_at,
      isActive: true,
      isSaved: false
    }

    return { data: transformedJob, error: null }
  } catch (error) {
    console.error('Error creating job:', error)
    return { data: null, error }
  }
}

/**
 * Toggle job bookmark
 * @param {string} jobId - Job ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null, isSaved: boolean}>}
 */
export async function toggleJobBookmark(jobId, userId) {
  try {
    // Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from('job_bookmarks')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('job_bookmarks')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      return { data: { jobId, userId }, error: null, isSaved: false }
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('job_bookmarks')
        .insert([{ job_id: jobId, user_id: userId }])

      if (insertError) throw insertError
      return { data: { jobId, userId }, error: null, isSaved: true }
    }
  } catch (error) {
    console.error('Error toggling job bookmark:', error)
    return { data: null, error, isSaved: false }
  }
}

/**
 * Fetch user's bookmarked jobs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchBookmarkedJobs(userId) {
  try {
    const { data, error } = await supabase
      .from('job_bookmarks')
      .select(`
        job_id,
        jobs (
          *,
          posted_by_user:users!posted_by (
            id,
            first_name,
            last_name,
            avatar_path,
            current_position,
            company
          )
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    // Transform data
    const transformedData = (data || []).map(bookmark => {
      const job = bookmark.jobs
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        experienceLevel: job.experience_level,
        description: job.description,
        salaryRange: job.salary_range,
        requiredSkills: job.required_skills || [],
        applicationUrl: job.application_url,
        contactEmail: job.contact_email,
        deadline: job.deadline,
        postedBy: {
          id: job.posted_by_user?.id,
          name: `${job.posted_by_user?.first_name || ''} ${job.posted_by_user?.last_name || ''}`.trim(),
          avatar: job.posted_by_user?.avatar_path || null,
          position: job.posted_by_user?.current_position || '',
          company: job.posted_by_user?.company || ''
        },
        postedDate: job.created_at,
        isActive: job.is_active,
        isSaved: true
      }
    })

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching bookmarked jobs:', error)
    return { data: [], error }
  }
}

/**
 * Check if user has bookmarked specific jobs
 * @param {Array<string>} jobIds - Array of job IDs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export async function checkUserBookmarks(jobIds, userId) {
  try {
    const { data, error } = await supabase
      .from('job_bookmarks')
      .select('job_id')
      .in('job_id', jobIds)
      .eq('user_id', userId)

    if (error) throw error

    // Create a map of bookmarked jobs
    const bookmarkedJobs = {}
    ;(data || []).forEach(bookmark => {
      bookmarkedJobs[bookmark.job_id] = true
    })

    return { data: bookmarkedJobs, error: null }
  } catch (error) {
    console.error('Error checking user bookmarks:', error)
    return { data: {}, error }
  }
}

/**
 * Update a job posting
 * @param {string} jobId - Job ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateJob(jobId, updates, userId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .eq('posted_by', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating job:', error)
    return { data: null, error }
  }
}

/**
 * Delete a job posting
 * @param {string} jobId - Job ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteJob(jobId, userId) {
  try {
    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('id', jobId)
      .eq('posted_by', userId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false, error }
  }
}

