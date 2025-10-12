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
      const response = await apiService.posts.create(postData, token)
      
      if (response.success) {
        await fetchPosts() // Refresh posts
        return response.data
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
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  const fetchAlumni = async (filters = {}) => {
    try {
      setLoading(true)
      const token = session?.access_token
      // This would use your actual API service
      // For now, return mock data
      const mockAlumni = [
        {
          id: '1',
          name: 'John Doe',
          batch: '2020',
          branch: 'Computer Science',
          company: 'Google',
          designation: 'Software Engineer',
          location: 'Bangalore'
        }
      ]
      setAlumni(mockAlumni)
      setError(null)
    } catch (err) {
      console.error('Error fetching alumni:', err)
      setError(err.message)
      setAlumni([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAlumni()
    }
  }, [session])

  return {
    alumni,
    loading,
    error,
    fetchAlumni,
    refreshAlumni: fetchAlumni
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