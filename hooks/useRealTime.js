/**
 * Real-time hooks for AlumniVerse Platform
 * Provides real-time data management and updates
 */

import { useEffect, useCallback, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { mockAPI } from '../lib/mockAPI'

// Custom hook for real-time alumni data
export function useAlumni() {
  const { state, dispatch, actionTypes } = useApp()
  const { alumni, alumniFilters, alumniLoading } = state

  const loadAlumni = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_ALUMNI_LOADING, payload: true })
    try {
      const response = await mockAPI.getAlumni(filters)
      dispatch({ type: actionTypes.SET_ALUMNI, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_ALUMNI_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const connectWithAlumni = useCallback(async (alumniId) => {
    try {
      const response = await mockAPI.connectWithAlumni(alumniId)
      dispatch({ type: actionTypes.ADD_CONNECTION, payload: response.data })
      
      // Show success notification
      dispatch({ 
        type: actionTypes.ADD_NOTIFICATION, 
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Connection Request Sent',
          message: `Connected with ${response.data.name}`,
          timestamp: new Date().toISOString(),
          read: false
        }
      })
      
      // Show toast
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: `Successfully connected with ${response.data.name}!`
        }
      })
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
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
  const { jobs, jobFilters, jobsLoading, savedJobs } = state

  const loadJobs = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_JOBS_LOADING, payload: true })
    try {
      const response = await mockAPI.getJobs(filters)
      dispatch({ type: actionTypes.SET_JOBS, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_JOB_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const toggleSavedJob = useCallback(async (jobId) => {
    try {
      await mockAPI.toggleJobBookmark(jobId)
      dispatch({ type: actionTypes.TOGGLE_SAVED_JOB, payload: jobId })
      
      const job = jobs.find(j => j.id === jobId)
      const isSaved = savedJobs.includes(jobId)
      
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: isSaved ? 'Job removed from saved list' : 'Job saved successfully!'
        }
      })
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, jobs, savedJobs])

  const createJob = useCallback(async (jobData) => {
    try {
      const response = await mockAPI.createJob(jobData)
      dispatch({ type: actionTypes.ADD_JOB, payload: response.data })
      
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Job posted successfully!'
        }
      })
      
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes])

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
  const { events, eventFilters, eventsLoading, registeredEvents } = state

  const loadEvents = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_EVENTS_LOADING, payload: true })
    try {
      const response = await mockAPI.getEvents(filters)
      dispatch({ type: actionTypes.SET_EVENTS, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_EVENT_FILTERS, payload: newFilters })
  }, [dispatch, actionTypes])

  const toggleEventRegistration = useCallback(async (eventId) => {
    try {
      const response = await mockAPI.toggleEventRegistration(eventId)
      dispatch({ type: actionTypes.TOGGLE_EVENT_REGISTRATION, payload: eventId })
      
      const isRegistered = registeredEvents.includes(eventId)
      
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: isRegistered ? 'Registration cancelled' : 'Successfully registered for event!'
        }
      })
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes, registeredEvents])

  const createEvent = useCallback(async (eventData) => {
    try {
      const response = await mockAPI.createEvent(eventData)
      dispatch({ type: actionTypes.ADD_EVENT, payload: response.data })
      
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Event created successfully!'
        }
      })
      
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes])

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
  const { posts, postsLoading } = state

  const loadPosts = useCallback(async () => {
    dispatch({ type: actionTypes.SET_POSTS_LOADING, payload: true })
    try {
      const response = await mockAPI.getPosts()
      dispatch({ type: actionTypes.SET_POSTS, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

  const createPost = useCallback(async (postData) => {
    try {
      const response = await mockAPI.createPost(postData)
      dispatch({ type: actionTypes.ADD_POST, payload: response.data })
      
      dispatch({
        type: actionTypes.SET_TOAST,
        payload: {
          type: 'success',
          message: 'Post created successfully!'
        }
      })
      
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [dispatch, actionTypes])

  const likePost = useCallback(async (postId) => {
    try {
      await mockAPI.likePost(postId)
      dispatch({ type: actionTypes.LIKE_POST, payload: postId })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

  const addComment = useCallback(async (postId, commentData) => {
    try {
      const response = await mockAPI.addComment(postId, commentData)
      dispatch({ 
        type: actionTypes.ADD_COMMENT, 
        payload: { postId, comment: response.data }
      })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    }
  }, [dispatch, actionTypes])

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
