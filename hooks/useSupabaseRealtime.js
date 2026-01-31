/**
 * Supabase Real-Time Subscription Hook
 * DISABLED: Using Firebase instead of Supabase for auth
 * These hooks are kept as no-ops to prevent breaking existing code
 */

/**
 * @param {Object} config - Configuration object (ignored - disabled)
 */
export function useSupabaseRealtime(config = {}) {
  // DISABLED - Supabase realtime is not being used
  // Return empty object to prevent errors
  return {
    isConnected: false
  }
}

/**
 * Helper hook for posts-only real-time updates (disabled)
 */
export function usePostsRealtime(onUpdate) {
  return { isConnected: false }
}

/**
 * Helper hook for jobs-only real-time updates (disabled)
 */
export function useJobsRealtime(onUpdate) {
  return { isConnected: false }
}

/**
 * Helper hook for events-only real-time updates (disabled)
 */
export function useEventsRealtime(onUpdate) {
  return { isConnected: false }
}
