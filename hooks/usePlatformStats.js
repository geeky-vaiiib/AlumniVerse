import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePlatformStats() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeUsers: 0,
    newConnections: 0,
    upcomingEvents: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total alumni count
        const { count: alumniCount, error: alumniError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)

        if (alumniError) throw alumniError

        // Fetch active users (logged in within last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { count: activeCount, error: activeError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)
          .gte('last_login', thirtyDaysAgo.toISOString())

        if (activeError) throw activeError

        // Fetch new connections (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { count: connectionsCount, error: connectionsError } = await supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString())

        if (connectionsError && connectionsError.code !== 'PGRST116') {
          console.warn('Connections table might not exist:', connectionsError)
        }

        // Fetch upcoming events
        const now = new Date().toISOString()
        
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('event_date', now)
          .eq('is_active', true)

        if (eventsError && eventsError.code !== 'PGRST116') {
          console.warn('Events table might not exist:', eventsError)
        }

        // Calculate active users percentage
        const activePercentage = alumniCount > 0 
          ? Math.round((activeCount / alumniCount) * 100) 
          : 0

        setStats({
          totalAlumni: alumniCount || 0,
          activeUsers: activePercentage,
          newConnections: connectionsCount || 0,
          upcomingEvents: eventsCount || 0,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching platform stats:', error)
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
    }

    fetchStats()

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return stats
}

export function useRecentUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpdates() {
      try {
        // Fetch recent events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, title, description, event_date, created_at')
          .order('created_at', { ascending: false })
          .limit(2)

        if (eventsError && eventsError.code !== 'PGRST116') {
          console.warn('Events table might not exist:', eventsError)
        }

        // Fetch recent jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, description, created_at')
          .order('created_at', { ascending: false })
          .limit(1)

        if (jobsError && jobsError.code !== 'PGRST116') {
          console.warn('Jobs table might not exist:', jobsError)
        }

        // Combine and format updates
        const allUpdates = []

        if (events && events.length > 0) {
          allUpdates.push(...events.map(event => ({
            id: `event-${event.id}`,
            title: event.title,
            description: event.description || 'Join us for this event',
            time: getTimeAgo(event.created_at),
            type: 'event'
          })))
        }

        if (jobs && jobs.length > 0) {
          allUpdates.push(...jobs.map(job => ({
            id: `job-${job.id}`,
            title: job.title,
            description: job.description?.substring(0, 50) + '...' || 'New opportunity available',
            time: getTimeAgo(job.created_at),
            type: 'opportunity'
          })))
        }

        // Add a platform feature update
        allUpdates.unshift({
          id: 'feature-1',
          title: 'Welcome to AlumniVerse',
          description: 'Connect with your alumni network',
          time: 'Recently',
          type: 'feature'
        })

        setUpdates(allUpdates.slice(0, 3))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching updates:', error)
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  return { updates, loading }
}

export function useSuggestedConnections(currentUserId, limit = 3) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuggestions() {
      if (!currentUserId) {
        setLoading(false)
        return
      }

      try {
        // Fetch users excluding current user
        const { data: users, error } = await supabase
          .from('users')
          .select('id, first_name, last_name, company, passing_year, avatar_path')
          .neq('auth_id', currentUserId)
          .eq('is_deleted', false)
          .eq('is_profile_complete', true)
          .limit(limit)

        if (error) throw error

        const formattedSuggestions = (users || []).map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          company: user.company || 'Not specified',
          batch: user.passing_year || 'N/A',
          mutualConnections: Math.floor(Math.random() * 20), // TODO: Calculate real mutual connections
          avatar: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        }))

        setSuggestions(formattedSuggestions)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching suggested connections:', error)
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [currentUserId, limit])

  return { suggestions, loading }
}

// Helper function to calculate time ago
function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

