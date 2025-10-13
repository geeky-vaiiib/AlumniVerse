'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'
import apiService from '../lib/api'

// Hook for managing posts
export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const token = session?.access_token
      const response = await apiService.posts.getAll({}, token)
      
      if (response.success && response.data.posts) {
        setPosts(response.data.posts)
      } else {
        // Fallback to mock data
        setPosts([])
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData) => {
    try {
      const token = session?.access_token
      const response = await apiService.posts.create({
        content: postData.content,
        post_type: postData.type || 'general',
        images: postData.images || [],
        tags: postData.tags || []
      }, token)
      
      if (response.success && response.data) {
        // Refresh posts to get the latest data
        await fetchPosts()
        return response.data.post
      } else {
        throw new Error(response.message || 'Failed to create post')
      }
    } catch (err) {
      console.error('Error creating post:', err)
      throw err
    }
  }

  useEffect(() => {
    if (session) {
      fetchPosts()
    }
  }, [session])

  return {
    posts,
    loading,
    error,
    createPost,
    refreshPosts: fetchPosts
  }
}

// Hook for managing alumni data
export function useAlumni() {
  const [alumniData, setAlumniData] = useState({
    alumni: [],
    pagination: {}
  })
  const [alumniLoading, setAlumniLoading] = useState(true)
  const [alumniError, setAlumniError] = useState(null)
  const [filters, setFilters] = useState({})
  const { session } = useAuth()

  const loadAlumni = async (appliedFilters = {}) => {
    try {
      setAlumniLoading(true)
      const token = session?.access_token
      
      // Build query parameters
      const params = new URLSearchParams()
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value)
        }
      })
      
      const endpoint = `/directory${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiService.request(endpoint, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.success && response.data) {
        setAlumniData({
          alumni: response.data.alumni || [],
          pagination: response.data.pagination || {}
        })
      } else {
        setAlumniData({ alumni: [], pagination: {} })
      }
      setAlumniError(null)
    } catch (err) {
      console.error('Error fetching alumni:', err)
      setAlumniError(err.message)
      setAlumniData({ alumni: [], pagination: {} })
    } finally {
      setAlumniLoading(false)
    }
  }

  const updateFilters = (newFilters) => {
    setFilters(newFilters)
    loadAlumni(newFilters)
  }

  const connectWithAlumni = async (alumniId) => {
    try {
      // Connection logic would go here
      console.log('Connecting with alumni:', alumniId)
      return { success: true }
    } catch (err) {
      console.error('Error connecting with alumni:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    if (session) {
      loadAlumni(filters)
    }
  }, [session])

  return {
    alumni: alumniData.alumni,
    alumniData,
    alumniLoading,
    alumniError,
    loadAlumni,
    updateFilters,
    connectWithAlumni,
    refreshAlumni: () => loadAlumni(filters)
  }
}

// Hook for managing jobs
export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  const fetchJobs = async (filters = {}) => {
    try {
      setLoading(true)
      const token = session?.access_token
      // This would use your actual API service
      const mockJobs = [
        {
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Bangalore',
          type: 'Full-time',
          description: 'Looking for a skilled software engineer...',
          postedBy: { name: 'Alumni Recruiter' },
          postedDate: new Date().toISOString()
        }
      ]
      setJobs(mockJobs)
      setError(null)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError(err.message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const createJob = async (jobData) => {
    try {
      const token = session?.access_token
      // This would use your actual API service
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        postedBy: { name: 'Current User' },
        postedDate: new Date().toISOString()
      }
      setJobs(prev => [newJob, ...prev])
      return newJob
    } catch (err) {
      console.error('Error creating job:', err)
      throw err
    }
  }

  useEffect(() => {
    if (session) {
      fetchJobs()
    }
  }, [session])

  return {
    jobs,
    loading,
    error,
    createJob,
    fetchJobs,
    refreshJobs: fetchJobs
  }
}

// Hook for managing events
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  const fetchEvents = async (filters = {}) => {
    try {
      setLoading(true)
      const token = session?.access_token
      // This would use your actual API service
      const mockEvents = [
        {
          id: '1',
          title: 'Alumni Networking Event',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Bangalore',
          description: 'Join us for a networking session...',
          category: 'networking',
          organizer: { name: 'Alumni Association' }
        }
      ]
      setEvents(mockEvents)
      setError(null)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData) => {
    try {
      const token = session?.access_token
      // This would use your actual API service
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        organizer: { name: 'Current User' }
      }
      setEvents(prev => [newEvent, ...prev])
      return newEvent
    } catch (err) {
      console.error('Error creating event:', err)
      throw err
    }
  }

  useEffect(() => {
    if (session) {
      fetchEvents()
    }
  }, [session])

  return {
    events,
    loading,
    error,
    createEvent,
    fetchEvents,
    refreshEvents: fetchEvents
  }
}