'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { initializeAuthHandler } from '@/lib/supabaseAuthHandler'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    console.log('🔐 [AUTH_PROVIDER] Initializing AuthProvider')
    
    // ✅ CRITICAL: Initialize global auth handler for OTP/magic link redirects
    if (typeof window !== 'undefined') {
      initializeAuthHandler()
    }
    
    // Set ready immediately for auth operations
    setIsReady(true)
    setAuthReady(true)
    setLoading(false)

    // Test Supabase connection (non-blocking)
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('*').limit(1)
        if (error) {
          console.warn('Supabase users table test failed (expected if auth_id column missing):', error.message)
        } else {
          console.log('✅ Supabase users table reachable')
        }
      } catch (err) {
        console.warn('Supabase connection test error (non-critical):', err.message)
      }
    }

    // Fetch or create user profile
    const fetchOrCreateProfile = async (userId, userEmail) => {
      try {
        console.log('[AUTH_PROVIDER] 🔍 Fetching profile for user:', userId)
        
        // 🔧 FIX: Use order + limit to avoid 406 errors with duplicates
        const { data: rows, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)

        if (fetchError) {
          console.error('[AUTH_PROVIDER] ❌ Profile fetch error:', fetchError)
          // Continue to try creating profile
        }

        const existingProfile = rows && rows.length > 0 ? rows[0] : null
        
        if (existingProfile) {
          console.log('[AUTH_PROVIDER] ✅ Profile already exists, skipping creation')
          return existingProfile
        }

        // No profile found, create one
        console.log('[AUTH_PROVIDER] 📝 Creating basic profile stub...')
        const response = await fetch('/api/profile/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            auth_id: userId, 
            email: userEmail,
            profile_completed: false  // 🔧 FIX: Explicitly set to false for stub creation
          })
        })

        const responseData = await response.json()
        console.log('[AUTH_PROVIDER] Profile creation response:', { status: response.status, data: responseData })

        if (response.ok && responseData.data) {
          console.log('[AUTH_PROVIDER] ✅ Profile stub created successfully')
          return responseData.data
        } else if (response.status === 409 || response.status === 200) {
          // 🔧 FIX: Handle 409 gracefully - profile already exists, fetch it again
          console.log('[AUTH_PROVIDER] ℹ️ Profile already exists (409/200), fetching it...')
          
          // Fetch the existing profile using safe method
          const { data: refetchRows } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
          
          const refetchedProfile = refetchRows && refetchRows.length > 0 ? refetchRows[0] : null
          if (refetchedProfile) {
            console.log('[AUTH_PROVIDER] ✅ Fetched existing profile after 409/200')
            return refetchedProfile
          }
          return null
        } else {
          console.error('[AUTH_PROVIDER] ❌ Profile creation failed:', responseData)
          return null
        }

      } catch (err) {
        console.error('[AUTH_PROVIDER] ❌ Profile fetch/create error:', err)
        return null
      }
    }

    // Get initial session with profile handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error)
            setSession(null)
            setUser(null)
          } else {
            setSession(session)
            setUser(session?.user ?? null)
            
            // If user is logged in, try to ensure profile exists (non-blocking)
            if (session?.user?.id) {
              fetchOrCreateProfile(session.user.id, session.user.email).catch(err => {
                console.warn('Profile creation failed during initialization (non-critical):', err)
              })
            }
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      }
    }

    // Test connection first
    testConnection()
    
    // Initialize session
    getInitialSession()

    // Listen for auth changes with profile handling - WITH DEBOUNCING
    let sessionTimeout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log("[AUTH_PROVIDER][EVENT] 🔄", {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        })
        
        // CRITICAL FIX: Don't clear session during transitions
        if (!session && event !== 'SIGNED_OUT') {
          console.log("[AUTH_PROVIDER] ⏸️ Preventing session clear during transition, event:", event)
          return
        }
        
        // DEBOUNCE: Clear any existing timeout and set a new one
        clearTimeout(sessionTimeout)
        sessionTimeout = setTimeout(async () => {
          if (!mounted) return
          
          console.log("[DEBUG] Processing debounced auth state change:", event)
          
          setLoading(true)
          setSession(session)
          setUser(session?.user ?? null)
          
          // 🔐 CRITICAL: Sync session to server immediately after SIGNED_IN
          if (event === 'SIGNED_IN' && session?.access_token) {
            console.log('[AUTH_PROVIDER] 🔐 SIGNED_IN - syncing session to server...')
            
            // 🔧 FIX: Add small delay to ensure Supabase client fully sets localStorage first
            await new Promise(resolve => setTimeout(resolve, 200))
            
            try {
              const syncResponse = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token
                })
              })
              
              if (syncResponse.ok) {
                const syncData = await syncResponse.json()
                console.log('[AUTH_PROVIDER] ✅ Session synced to server successfully:', syncData)
                
                // 🔧 CRITICAL: Wait a bit more to ensure cookies are set on server
                await new Promise(resolve => setTimeout(resolve, 300))
                console.log('[AUTH_PROVIDER] ✅ Server cookies should be fully set now')
              } else {
                const errorText = await syncResponse.text()
                console.error('[AUTH_PROVIDER] ❌ Failed to sync session to server:', errorText)
              }
            } catch (syncError) {
              console.error('[AUTH_PROVIDER] ❌ Session sync error:', syncError)
            }
            
            // Handle profile creation for new sessions
            console.log('[AUTH_PROVIDER] SIGNED_IN event - triggering profile fetch/create')
            // 🔧 FIX: Only create profile if we don't already have one in the current context
            await fetchOrCreateProfile(session.user.id, session.user.email)
          }
          
          setLoading(false)
          setIsReady(true)
          setAuthReady(true)
          
          console.log("[DEBUG][TIME]", new Date().toISOString(), "AuthReady:", true, "Session:", !!session, "User:", !!session?.user)
        }, 300) // 300ms debounce to let Supabase stabilize
      }
    )

    return () => {
      mounted = false
      clearTimeout(sessionTimeout)
      subscription?.unsubscribe()
    }
  }, [])

    // Sign up with OTP
  const signUpWithOTP = async (email, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: userData,
          shouldCreateUser: true,
          // ✅ CRITICAL: Set redirectTo for OTP email link
          emailRedirectTo: `${window.location.origin}/auth?redirectTo=/dashboard`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  // Sign in with OTP
  const signInWithOTP = async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          // ✅ CRITICAL: Set redirectTo for OTP email link
          emailRedirectTo: `${window.location.origin}/auth?redirectTo=/dashboard`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in with OTP error:', error)
      return { data: null, error }
    }
  }

  // Verify OTP with robust session handling and profile creation
  const verifyOTP = async (email, token, userData = {}) => {
    try {
      console.log('🔐 [TEMP] AuthProvider: Starting OTP verification', { email, hasUserData: !!userData })
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        console.error('🔐 [TEMP] AuthProvider: OTP verification failed', error)
        throw error
      }

      const session = data?.session ?? null
      const user = session?.user ?? null

      if (!user) {
        throw new Error('No user returned after OTP verification')
      }

      console.log('🔐 [TEMP] AuthProvider: OTP verification successful', { 
        userId: user.id, 
        email: user.email,
        hasSession: !!session 
      })

      // FIXED: Increased wait time for session to fully propagate to prevent race conditions
      console.log('🔐 [TEMP] AuthProvider: Waiting for session propagation...')
      await new Promise(resolve => setTimeout(resolve, 800))

      // Get fresh session from client
      const { data: sessionRes } = await supabase.auth.getSession()
      const currentUser = sessionRes?.session?.user ?? user

      console.log('🔐 [TEMP] AuthProvider: Fresh session retrieved', { 
        currentUserId: currentUser.id,
        hasSession: !!sessionRes?.session
      })

      // Check if profile exists
      const { data: profileRows, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(1)
      
      const profile = profileRows && profileRows.length > 0 ? profileRows[0] : null

      // If profile doesn't exist, create it via server endpoint
      if (!profile || profileErr) {
        console.log('Profile not found, creating via server endpoint...')
        
        try {
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              auth_id: currentUser.id,
              email: currentUser.email,
              first_name: userData.first_name || userData.firstName || null,
              last_name: userData.last_name || userData.lastName || null,
              usn: userData.usn || null,
              branch: userData.branch || null,
              branch_code: userData.branch_code || null,
              admission_year: userData.admission_year || userData.joining_year || null,
              passing_year: userData.passing_year || null
            })
          })

          if (response.ok) {
            console.log('Profile created successfully via server endpoint')
          } else if (response.status === 409) {
            // Profile already exists - this is fine, not an error
            console.log('Profile already exists (expected on re-verification)')
          } else {
            const errorData = await response.json()
            console.warn('Server profile creation failed:', errorData)
          }
        } catch (serverError) {
          console.warn('Server profile creation error:', serverError)
          // Continue anyway - profile can be created later
        }
      } else if (profile) {
        console.log('Profile found in database')
      }

      return { data, error: null }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { data: null, error }
    }
  }

  // Sign up with password
  const signUpWithPassword = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up with password error:', error)
      return { data: null, error }
    }
  }

  // Sign in with password
  const signInWithPassword = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Don't log error for invalid credentials - it's expected for OTP-only users
        if (error.code !== 'invalid_credentials') {
          console.error('Sign in with password error:', error)
        }
        throw error
      }
      return { data, error: null }
    } catch (error) {
      // Only log unexpected errors, not invalid credentials
      if (error.code !== 'invalid_credentials') {
        console.error('Password login error:', error)
      }
      return { data: null, error }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    }
  }

  // Update password
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { data: null, error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setSession(null)
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    loading,
    isReady,
    authReady,
    isLoggedIn: !!session,
    signUpWithOTP,
    signInWithOTP,
    verifyOTP,
    signUpWithPassword,
    signInWithPassword,
    resetPassword,
    updatePassword,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
