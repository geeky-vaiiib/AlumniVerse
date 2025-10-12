'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'

// Hook for platform statistics
export function usePlatformStats() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeUsers: 0,
    newConnections: 0,
    upcomingEvents: 0,
    loading: true
  })

  useEffect(() => {
    // Simulate loading and then set mock data
    const timer = setTimeout(() => {
      setStats({
        totalAlumni: 1247,
        activeUsers: 89,
        newConnections: 23,
        upcomingEvents: 8,
        loading: false
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return stats
}

// Hook for recent platform updates
export function useRecentUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading and then set mock data
    const timer = setTimeout(() => {
      setUpdates([
        {
          id: '1',
          type: 'feature',
          title: 'New Messaging Feature',
          description: 'Connect directly with alumni through private messages',
          time: '2 hours ago'
        },
        {
          id: '2',
          type: 'event',
          title: 'Upcoming Tech Talk',
          description: 'Join us for a discussion on AI in the workplace',
          time: '1 day ago'
        },
        {
          id: '3',
          type: 'update',
          title: 'Profile Enhancements',
          description: 'New fields added to showcase your achievements',
          time: '3 days ago'
        }
      ])
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return { updates, loading }
}

// Hook for suggested connections
export function useSuggestedConnections(userId, limit = 5) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Simulate loading and then set mock data
    const timer = setTimeout(() => {
      setSuggestions([
        {
          id: '1',
          name: 'Sarah Chen',
          company: 'Microsoft',
          batch: '2019',
          avatar: 'SC',
          mutualConnections: 5
        },
        {
          id: '2',
          name: 'Raj Patel',
          company: 'Amazon',
          batch: '2020',
          avatar: 'RP',
          mutualConnections: 3
        },
        {
          id: '3',
          name: 'Emily Johnson',
          company: 'Meta',
          batch: '2018',
          avatar: 'EJ',
          mutualConnections: 7
        }
      ].slice(0, limit))
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [userId, limit])

  return { suggestions, loading }
}