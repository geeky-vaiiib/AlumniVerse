/**
 * Supabase Real-Time Subscription Hook
 * Listens to database changes and triggers callbacks
 */

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '../lib/supabase-singleton'

const supabase = getSupabaseClient()

/**
 * @param {Object} config - Configuration object
 * @param {Function} config.onPostsChange - Callback for posts table changes
 * @param {Function} config.onJobsChange - Callback for jobs table changes
 * @param {Function} config.onEventsChange - Callback for events table changes
 * @param {Function} config.onUsersChange - Callback for users table changes
 * @param {boolean} config.enabled - Enable/disable subscriptions (default: true)
 */
export function useSupabaseRealtime(config = {}) {
  const {
    onPostsChange,
    onJobsChange,
    onEventsChange,
    onUsersChange,
    enabled = true
  } = config

  const channelRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    console.log('🔄 [REALTIME] Setting up Supabase real-time subscriptions...')

    // Create a single channel for all subscriptions
    const channel = supabase.channel('db-changes')

    // Subscribe to posts changes
    if (onPostsChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('🔄 [REALTIME] Posts changed:', payload.eventType, payload)
          onPostsChange(payload)
        }
      )
    }

    // Subscribe to jobs changes
    if (onJobsChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('🔄 [REALTIME] Jobs changed:', payload.eventType, payload)
          onJobsChange(payload)
        }
      )
    }

    // Subscribe to events changes
    if (onEventsChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('🔄 [REALTIME] Events changed:', payload.eventType, payload)
          onEventsChange(payload)
        }
      )
    }

    // Subscribe to users changes (for directory)
    if (onUsersChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('🔄 [REALTIME] Users changed:', payload.eventType, payload)
          onUsersChange(payload)
        }
      )
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ [REALTIME] Successfully subscribed to database changes')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ [REALTIME] Failed to subscribe to database changes')
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ [REALTIME] Subscription timed out')
      }
    })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      console.log('🧹 [REALTIME] Cleaning up subscriptions...')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [enabled, onPostsChange, onJobsChange, onEventsChange, onUsersChange])

  return {
    isConnected: !!channelRef.current
  }
}

/**
 * Helper hook for posts-only real-time updates
 */
export function usePostsRealtime(onUpdate) {
  return useSupabaseRealtime({
    onPostsChange: (payload) => {
      if (onUpdate) {
        onUpdate(payload)
      }
    }
  })
}

/**
 * Helper hook for jobs-only real-time updates
 */
export function useJobsRealtime(onUpdate) {
  return useSupabaseRealtime({
    onJobsChange: (payload) => {
      if (onUpdate) {
        onUpdate(payload)
      }
    }
  })
}

/**
 * Helper hook for events-only real-time updates
 */
export function useEventsRealtime(onUpdate) {
  return useSupabaseRealtime({
    onEventsChange: (payload) => {
      if (onUpdate) {
        onUpdate(payload)
      }
    }
  })
}
