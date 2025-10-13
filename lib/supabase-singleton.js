/**
 * ========================================
 * SINGLE SOURCE OF TRUTH FOR SUPABASE CLIENT
 * ========================================
 * 
 * This file ensures ONLY ONE Supabase client instance exists
 * across the entire application to prevent "Multiple GoTrueClient" warnings
 * 
 * ⚠️ CRITICAL: Always import from THIS file, never create new clients
 * 
 * Usage:
 * import { getSupabaseClient } from '@/lib/supabase-singleton'
 * const supabase = getSupabaseClient()
 */

import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance = null

/**
 * Get or create the singleton Supabase client
 * @returns {Object} Supabase client instance
 */
export function getSupabaseClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[SUPABASE] Missing environment variables!')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    // Return stub client for build-time safety
    return createStubClient()
  }

  // Create singleton instance
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`,
    },
    global: {
      headers: {
        'X-Client-Info': 'alumniverse-web-app',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  console.log('✅ [SUPABASE] Singleton client initialized')
  return supabaseInstance
}

/**
 * Create a stub client for build-time safety
 * @returns {Object} Stub Supabase client
 */
function createStubClient() {
  const notConfigured = (method = 'method') => async () => ({
    data: null,
    error: new Error(`Supabase not configured. Missing env vars for ${method}`),
  })

  return {
    auth: {
      getSession: notConfigured('getSession'),
      signInWithPassword: notConfigured('signInWithPassword'),
      signUp: notConfigured('signUp'),
      signInWithOtp: notConfigured('signInWithOtp'),
      verifyOtp: notConfigured('verifyOtp'),
      signOut: notConfigured('signOut'),
      updateUser: notConfigured('updateUser'),
      resetPasswordForEmail: notConfigured('resetPasswordForEmail'),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: notConfigured('select'),
      insert: notConfigured('insert'),
      update: notConfigured('update'),
      delete: notConfigured('delete'),
      upsert: notConfigured('upsert'),
    }),
    channel: () => ({
      on: () => {},
      subscribe: () => 'SUBSCRIBED',
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  }
}

/**
 * Reset singleton instance (for testing only)
 */
export function resetSupabaseInstance() {
  if (supabaseInstance) {
    console.warn('[SUPABASE] Resetting singleton instance')
    supabaseInstance = null
  }
}

// Legacy export for compatibility
export const supabase = getSupabaseClient()
export default getSupabaseClient
