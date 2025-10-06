'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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

  useEffect(() => {
    let mounted = true

    // Set ready immediately for auth operations
    setIsReady(true)
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
        console.log('Fetching profile for user:', userId)
        
        // Try to fetch existing profile
        const { data, error, status } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', userId)
          .maybeSingle()

        if (error && status === 406) {
          console.warn('Profile not found (406), creating via server endpoint...')
          
          // Create profile via server endpoint
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              auth_id: userId, 
              email: userEmail 
            })
          })

          if (!response.ok) {
            const text = await response.text()
            console.error('Server profile creation failed:', text)
            return null
          }

          const result = await response.json()
          console.log('✅ Profile created via server endpoint')
          return result.data
        }

        if (error) {
          console.error('Profile fetch error:', error)
          return null
        }

        if (data) {
          console.log('✅ Profile found in database')
          return data
        }

        // No profile found, create one
        console.log('No profile found, creating...')
        const response = await fetch('/api/profile/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            auth_id: userId, 
            email: userEmail 
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Profile created successfully')
          return result.data
        } else {
          const errorText = await response.text()
          console.error('Profile creation failed:', errorText)
          return null
        }

      } catch (err) {
        console.error('Profile fetch/create error:', err)
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

    // Listen for auth changes with profile handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('AuthProvider: Auth state change:', {
            event,
            hasSession: !!session,
            userEmail: session?.user?.email,
            userId: session?.user?.id,
            sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry'
          })
          
          setSession(session)
          setUser(session?.user ?? null)
          
          // Handle profile creation for new sessions (non-blocking)
          if (event === 'SIGNED_IN' && session?.user?.id) {
            console.log('AuthProvider: User signed in, ensuring profile exists...')
            fetchOrCreateProfile(session.user.id, session.user.email).catch(err => {
              console.warn('Profile creation failed during sign-in (non-critical):', err)
            })
          }
          
          if (event === 'SIGNED_OUT') {
            console.log('AuthProvider: User signed out, clearing state')
          }
        }
      }
    )

    return () => {
      mounted = false
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
          shouldCreateUser: true
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
          shouldCreateUser: false
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) throw error

      const session = data?.session ?? null
      const user = session?.user ?? null

      if (!user) {
        throw new Error('No user returned after OTP verification')
      }

      // Wait for session to propagate
      await new Promise(resolve => setTimeout(resolve, 400))

      // Get fresh session from client
      const { data: sessionRes } = await supabase.auth.getSession()
      const currentUser = sessionRes?.session?.user ?? user

      // Check if profile exists
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', currentUser.id)
        .single()

      // If profile doesn't exist, create it via server endpoint
      if (profileErr && (profileErr.code === 'PGRST116' || profileErr.status === 404)) {
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
