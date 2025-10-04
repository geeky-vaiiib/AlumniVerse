/**
 * Real-time hooks for AlumniVerse Platform
 * Provides real-time data management and updates
 */

import { useEffect, useCallback, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { useUser } from '../contexts/UserContext'
import { mockAPI } from '../lib/mockAPI'
import * as postsAPI from '../lib/api/posts'
import * as jobsAPI from '../lib/api/jobs'
import * as eventsAPI from '../lib/api/events'
import * as alumniAPI from '../lib/api/alumni'

// Custom hook for real-time alumni data
export function useAlumni() {
  const { state, dispatch, actionTypes } = useApp()
  const { alumni, alumniFilters, alumniLoading } = state

  const loadAlumni = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_ALUMNI_LOADING, payload: true })
    try {
      const { data, error } = await alumniAPI.fetchAlumniDirectory(filters)
      if (error) throw new Error(error)
      
      // Transform the API response to match the expected format
      const transformedData = {
        alumni: data.alumni || [],
        pagination: data.pagination || {},
        filters: data.filters || {}
      }
      
      dispatch({ type: actionTypes.SET_ALUMNI, payload: transformedData })
    } catch (error) {
      console.error('Error loading alumni:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_ALUMNI_LOADING, payload: false })
    }
  }, [dispatch, actionTypes])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_ALUMNI_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const connectWithAlumni = useCallback(async (alumniId) => {
    try {
      const { data, error } = await alumniAPI.connectWithAlumni(alumniId)
      if (error) throw new Error(error)
      
      dispatch({ type: actionTypes.ADD_CONNECTION, payload: { id: alumniId } })
      
      // Show success notification
      dispatch({ 
        type: actionTypes.ADD_NOTIFICATION, 
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Connection Request Sent',
          message: data.message || 'Connection request sent successfully',
          timestamp: new Date().toISOString(),
          read: false
        }
      })
      
      // Show toast
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: data.message || 'Connection request sent successfully!'
        }
      })
      
    } catch (error) {
      console.error('Error connecting with alumni:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      
      // Show error toast
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'error',
          message: error.message || 'Failed to send connection request'
        }
      })
    }
  }, [dispatch, actionTypes])

  // Auto-reload alumni when filters change
  useEffect(() => {
    loadAlumni(alumniFilters)
  }, [loadAlumni, alumniFilters])

  return {
    alumni,
    alumniFilters,
    alumniLoading,
    loadAlumni,
    updateFilters,
    connectWithAlumni
  }
}

// Custom hook for real-time job data
export function useJobs() {
  const { state, dispatch, actionTypes } = useApp()
  const { userProfile } = useUser()
  const { jobs, jobFilters, jobsLoading, savedJobs } = state

  const loadJobs = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_JOBS_LOADING, payload: true })
    try {
      const { data, error } = await jobsAPI.fetchJobs({ limit: 50, activeOnly: true })
      if (error) throw error

      // Check which jobs are bookmarked by user
      if (userProfile?.id && data.length > 0) {
        const jobIds = data.map(j => j.id)
        const { data: bookmarks } = await jobsAPI.checkUserBookmarks(jobIds, userProfile.id)

        // Update isSaved status
        data.forEach(job => {
          job.isSaved = bookmarks[job.id] || false
        })
      }

      dispatch({ type: actionTypes.SET_JOBS, payload: data })
    } catch (error) {
      console.error('Error loading jobs:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_JOB_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const toggleSavedJob = useCallback(async (jobId) => {
    if (!userProfile?.id) {
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'error',
          message: 'Please log in to save jobs'
        }
      })
      return
    }

    try {
      const { isSaved, error } = await jobsAPI.toggleJobBookmark(jobId, userProfile.id)
      if (error) throw error

      dispatch({ type: actionTypes.TOGGLE_SAVED_JOB, payload: jobId })

      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: isSaved ? 'Job saved successfully!' : 'Job removed from saved list'
        }
      })

    } catch (error) {
      console.error('Error toggling job bookmark:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const createJob = useCallback(async (jobData) => {
    if (!userProfile?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await jobsAPI.createJob({
        ...jobData,
        postedBy: userProfile.id
      })

      if (error) throw error

      dispatch({ type: actionTypes.ADD_JOB, payload: data })

      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Job posted successfully!'
        }
      })

      return data
    } catch (error) {
      console.error('Error creating job:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes, userProfile])

  // Auto-reload jobs when filters change
  useEffect(() => {
    loadJobs(jobFilters)
  }, [loadJobs, jobFilters])

  return {
    jobs,
    jobFilters,
    jobsLoading,
    savedJobs,
    loadJobs,
    updateFilters,
    toggleSavedJob,
    createJob
  }
}

// Custom hook for real-time event data
export function useEvents() {
  const { state, dispatch, actionTypes } = useApp()
  const { userProfile } = useUser()
  const { events, eventFilters, eventsLoading, registeredEvents } = state

  const loadEvents = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_EVENTS_LOADING, payload: true })
    try {
      const { data, error } = await eventsAPI.fetchEvents({ limit: 50, upcomingOnly: true })
      if (error) throw error

      // Check which events user is registered for
      if (userProfile?.id && data.length > 0) {
        const eventIds = data.map(e => e.id)
        const { data: registrations } = await eventsAPI.checkUserRegistrations(eventIds, userProfile.id)

        // Update isRegistered status
        data.forEach(event => {
          event.isRegistered = registrations[event.id] || false
        })
      }

      dispatch({ type: actionTypes.SET_EVENTS, payload: data })
    } catch (error) {
      console.error('Error loading events:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_EVENT_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const toggleEventRegistration = useCallback(async (eventId) => {
    if (!userProfile?.id) {
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'error',
          message: 'Please log in to register for events'
        }
      })
      return
    }

    try {
      const { isRegistered, error } = await eventsAPI.toggleEventRegistration(eventId, userProfile.id)
      if (error) throw error

      dispatch({ type: actionTypes.TOGGLE_EVENT_REGISTRATION, payload: eventId })

      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: isRegistered ? 'Successfully registered for event!' : 'Registration cancelled'
        }
      })

    } catch (error) {
      console.error('Error toggling event registration:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const createEvent = useCallback(async (eventData) => {
    if (!userProfile?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await eventsAPI.createEvent({
        ...eventData,
        organizedBy: userProfile.id
      })

      if (error) throw error

      dispatch({ type: actionTypes.ADD_EVENT, payload: data })

      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Event created successfully!'
        }
      })

      return data
    } catch (error) {
      console.error('Error creating event:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes, userProfile])

  // Auto-reload events when filters change
  useEffect(() => {
    loadEvents(eventFilters)
  }, [loadEvents, eventFilters])

  return {
    events,
    eventFilters,
    eventsLoading,
    registeredEvents,
    loadEvents,
    updateFilters,
    toggleEventRegistration,
    createEvent
  }
}

// Custom hook for real-time posts/news feed
export function usePosts() {
  const { state, dispatch, actionTypes } = useApp()
  const { userProfile } = useUser()
  const { posts, postsLoading } = state

  const loadPosts = useCallback(async () => {
    dispatch({ type: actionTypes.SET_POSTS_LOADING, payload: true })
    try {
      const { data, error } = await postsAPI.fetchPosts({ limit: 50 })
      if (error) throw error

      // Check which posts are liked by user
      if (userProfile?.id && data.length > 0) {
        const postIds = data.map(p => p.id)
        const { data: likes } = await postsAPI.checkUserLikes(postIds, userProfile.id)

        // Update isLiked status
        data.forEach(post => {
          post.isLiked = likes[post.id] || false
        })
      }

      dispatch({ type: actionTypes.SET_POSTS, payload: data })
    } catch (error) {
      console.error('Error loading posts:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const createPost = useCallback(async (postData) => {
    if (!userProfile?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await postsAPI.createPost({
        content: postData.content,
        post_type: postData.type || 'general',
        images: postData.images || [],
        links: postData.links || [],
        tags: postData.tags || [],
        author_id: userProfile.id
      })

      if (error) throw error

      dispatch({ type: actionTypes.ADD_POST, payload: data })

      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Post created successfully!'
        }
      })

      return data
    } catch (error) {
      console.error('Error creating post:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes, userProfile])

  const likePost = useCallback(async (postId) => {
    if (!userProfile?.id) {
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'error',
          message: 'Please log in to like posts'
        }
      })
      return
    }

    try {
      const { error } = await postsAPI.togglePostLike(postId, userProfile.id)
      if (error) throw error

      dispatch({ type: actionTypes.LIKE_POST, payload: postId })
    } catch (error) {
      console.error('Error liking post:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  const addComment = useCallback(async (postId, commentData) => {
    if (!userProfile?.id) {
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'error',
          message: 'Please log in to comment'
        }
      })
      return
    }

    try {
      const { data, error } = await postsAPI.addComment(postId, {
        author_id: userProfile.id,
        content: commentData.content
      })

      if (error) throw error

      dispatch({
        type: actionTypes.ADD_COMMENT,
        payload: { postId, comment: data }
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, userProfile])

  // Load posts on mount
  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return {
    posts,
    postsLoading,
    loadPosts,
    createPost,
    likePost,
    addComment
  }
}

// Custom hook for real-time notifications
export function useNotifications() {
  const { state, dispatch, actionTypes } = useApp()
  const { notifications, unreadCount } = state

  const addNotification = useCallback((notification) => {
    dispatch({ 
      type: actionTypes.ADD_NOTIFICATION, 
      payload: {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      }
    })
  }, [dispatch, actionTypes])

  const markAsRead = useCallback((notificationId) => {
    dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: notificationId })
  }, [dispatch, actionTypes])

  const clearAll = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_NOTIFICATIONS })
  }, [dispatch, actionTypes])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll
  }
}

// Custom hook for real-time toast notifications
export function useToast() {
  const { state, dispatch, actionTypes } = useApp()
  const { toast } = state
  const timeoutRef = useRef(null)

  const showToast = useCallback((toastData) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    dispatch({ type: actionTypes.SET_TOAST, payload: toastData })

    // Auto-clear toast after 3 seconds
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: actionTypes.CLEAR_TOAST })
    }, 3000)
  }, [dispatch, actionTypes])

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    dispatch({ type: actionTypes.CLEAR_TOAST })
  }, [dispatch, actionTypes])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}

// Custom hook for simulating real-time updates
export function useRealTimeUpdates() {
  const { dispatch, actionTypes } = useApp()

  useEffect(() => {
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Simulate new notifications
      const notifications = [
        {
          type: 'info',
          title: 'New Connection Request',
          message: 'Someone wants to connect with you',
          icon: 'users'
        },
        {
          type: 'success',
          title: 'Job Application Update',
          message: 'Your application has been viewed',
          icon: 'briefcase'
        },
        {
          type: 'info',
          title: 'Event Reminder',
          message: 'Alumni meetup starts in 1 hour',
          icon: 'calendar'
        }
      ]

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      
      dispatch({ 
        type: actionTypes.ADD_NOTIFICATION, 
        payload: {
          id: Date.now(),
          ...randomNotification,
          timestamp: new Date().toISOString(),
          read: false
        }
      })
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [dispatch, actionTypes])

  // Simulate badge progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update user stats
      const statUpdates = {
        points: Math.floor(Math.random() * 10) + 1,
        streak: Math.floor(Math.random() * 2)
      }
      
      dispatch({ type: actionTypes.UPDATE_USER_STATS, payload: statUpdates })
    }, 60000) // 1 minute

    return () => clearInterval(interval)
  }, [dispatch, actionTypes])
}
