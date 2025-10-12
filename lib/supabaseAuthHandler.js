/**
 * Supabase Auth Handler - Global Auth State Listener
 * 
 * This module handles OTP/magic link redirects by detecting session in URL
 * and redirecting to dashboard after successful authentication.
 * 
 * CRITICAL for OTP/magic link flows to work properly.
 */

import { supabase } from './supabaseClient'

let isInitialized = false
let hasHandledRedirect = false

/**
 * Initialize global auth state handler
 * Call this ONCE in app bootstrap (layout or main entry point)
 */
export function initializeAuthHandler() {
  if (isInitialized) {
    console.log('[AUTH_HANDLER] Already initialized, skipping')
    return
  }
  
  isInitialized = true
  console.log('[AUTH_HANDLER] 🚀 Initializing global auth handler')

  // STEP 1: Immediately attempt to handle session from URL (OTP/magic link)
  handleInitialSession()

  // STEP 2: Listen for auth state changes
  setupAuthStateListener()
}

/**
 * Handle initial session from URL fragment/query
 * This runs immediately on page load to capture OTP/magic link tokens
 */
async function handleInitialSession() {
  try {
    console.log('[AUTH_HANDLER] 🔍 Checking for session in URL...')
    console.log('[AUTH_HANDLER] Current URL:', window.location.href)
    console.log('[AUTH_HANDLER] Hash:', window.location.hash)
    console.log('[AUTH_HANDLER] Search:', window.location.search)
    
    // getSession() will automatically parse tokens from URL if detectSessionInUrl=true
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[AUTH_HANDLER] ❌ Error reading session:', error)
      return
    }
    
    const session = data?.session
    
    if (session) {
      console.log('[AUTH_HANDLER] ✅ Session found on page load:', {
        user: session.user?.email,
        expires_at: session.expires_at,
        access_token: session.access_token?.substring(0, 20) + '...'
      })
      
      // If we're on the auth page with a valid session, redirect to intended page
      if (window.location.pathname === '/auth' || window.location.pathname.startsWith('/auth')) {
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirectTo') || '/dashboard'
        
        console.log('[AUTH_HANDLER] 🎯 Auth page with session detected, redirecting to:', redirectTo)
        
        // Small delay to ensure session is fully persisted
        setTimeout(() => {
          window.location.href = redirectTo
        }, 500)
      }
    } else {
      console.log('[AUTH_HANDLER] ℹ️  No session found on initial page load')
    }
  } catch (err) {
    console.error('[AUTH_HANDLER] ❌ Unexpected error in handleInitialSession:', err)
  }
}

/**
 * Setup listener for auth state changes
 * Handles SIGNED_IN event from OTP/magic link completion
 */
function setupAuthStateListener() {
  console.log('[AUTH_HANDLER] 👂 Setting up auth state change listener')
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('[AUTH_HANDLER] 🔔 Auth state changed:', event, {
      hasSession: !!session,
      user: session?.user?.email,
      pathname: window.location.pathname
    })

    // Handle SIGNED_IN event (triggered after OTP/magic link verification)
    if (event === 'SIGNED_IN' && session && !hasHandledRedirect) {
      hasHandledRedirect = true
      
      console.log('[AUTH_HANDLER] ✅ User signed in successfully')
      console.log('[AUTH_HANDLER] Session data:', {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: session.expires_at
      })
      
      // Check if we're on auth page and need to redirect
      const currentPath = window.location.pathname
      if (currentPath === '/auth' || currentPath.startsWith('/auth')) {
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirectTo') || '/dashboard'
        
        console.log('[AUTH_HANDLER] 🎯 Redirecting after sign-in to:', redirectTo)
        
        // Use setTimeout to ensure session is fully persisted
        setTimeout(() => {
          window.location.href = redirectTo
        }, 500)
      }
    }

    // Handle SIGNED_OUT event
    if (event === 'SIGNED_OUT') {
      console.log('[AUTH_HANDLER] 👋 User signed out')
      hasHandledRedirect = false
      
      // Optional: redirect to auth page
      // if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
      //   window.location.href = '/auth'
      // }
    }

    // Handle TOKEN_REFRESHED event
    if (event === 'TOKEN_REFRESHED') {
      console.log('[AUTH_HANDLER] 🔄 Token refreshed successfully')
    }
  })

  // Cleanup function (not typically needed but good practice)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      subscription?.unsubscribe()
    })
  }
}

/**
 * Manual redirect helper (for use in components if needed)
 */
export async function redirectToDashboardIfAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session && window.location.pathname === '/auth') {
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get('redirectTo') || '/dashboard'
    
    console.log('[AUTH_HANDLER] Manual redirect to:', redirectTo)
    window.location.href = redirectTo
  }
}

// Export supabase client for convenience
export { supabase }
