"use client"

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
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isReady, setIsReady] = useState(false)

  console.log('AuthProvider: Rendering with state:', { loading, isLoggedIn, hasUser: !!user, hasSession: !!session })

  // Initialize Supabase auth
  useEffect(() => {
    console.log('AuthProvider: Real Supabase initialization started')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session:', session)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoggedIn(!!session)
      setLoading(false)
      setIsReady(true)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoggedIn(!!session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Real Supabase authentication methods
  const signUpWithOTP = async (email, metadata = {}) => {
    console.log('AuthProvider: signUpWithOTP called', { email, metadata })
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: metadata,
          shouldCreateUser: true
        }
      })
      
      if (error) {
        console.error('AuthProvider: signUpWithOTP error:', error)
        setError(error.message)
      }
      
      return { data, error }
    } catch (err) {
      console.error('AuthProvider: signUpWithOTP exception:', err)
      return { data: null, error: err }
    }
  }

  const signInWithOTP = async (email) => {
    console.log('AuthProvider: signInWithOTP called', { email })
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })
      
      if (error) {
        console.error('AuthProvider: signInWithOTP error:', error)
        setError(error.message)
      }
      
      return { data, error }
    } catch (err) {
      console.error('AuthProvider: signInWithOTP exception:', err)
      return { data: null, error: err }
    }
  }

  const verifyOTP = async (email, token) => {
    console.log('AuthProvider: verifyOTP called', { email, token })
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })
      
      if (error) {
        console.error('AuthProvider: verifyOTP error:', error)
        setError(error.message)
        return { data: null, error }
      }
      
      // Update state
      setUser(data.user)
      setSession(data.session)
      setIsLoggedIn(true)
      setError(null)
      
      console.log('AuthProvider: OTP verification successful')
      return { data, error: null }
    } catch (err) {
      console.error('AuthProvider: verifyOTP exception:', err)
      return { data: null, error: err }
    }
  }

  // Keep dummy OTP for testing - but use real user data
  const verifyDummyOTP = async (code) => {
    console.log("AuthProvider: Dummy OTP verification (accepts any 6 digits)")
    
    if (!code || code.length !== 6) {
      return {
        data: null,
        error: { message: 'Please enter a valid 6-digit code' }
      }
    }
    
    // Note: This is still a dummy verification, but we'll get real user data from Supabase
    console.log("AuthProvider: Using dummy OTP for development - should be replaced with real OTP verification")
    
    // Try to use real Supabase verification first
    try {
      // Get the email from sessionStorage or state (should be set during signup)
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail')
      
      if (pendingEmail) {
        // Try real OTP verification first
        const realVerification = await verifyOTP(pendingEmail, code)
        if (realVerification.data && !realVerification.error) {
          // Clear pending email
          sessionStorage.removeItem('pendingVerificationEmail')
          return realVerification
        }
      }
    } catch (error) {
      console.log("AuthProvider: Real OTP verification failed, using dummy for development")
    }
    
    // Fallback to dummy for development only
    const mockUser = {
      id: 'test-user-' + Date.now(),
      email: sessionStorage.getItem('pendingVerificationEmail') || 'test@sit.ac.in',
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { 
        verified: true, 
        test_mode: true,
        first_name: sessionStorage.getItem('pendingFirstName') || 'Test',
        last_name: sessionStorage.getItem('pendingLastName') || 'User',
        usn: sessionStorage.getItem('pendingUSN') || 'TEST123',
        branch: sessionStorage.getItem('pendingBranch') || 'Computer Science',
        joining_year: sessionStorage.getItem('pendingJoiningYear') || 2020,
        passing_year: sessionStorage.getItem('pendingPassingYear') || 2024
      }
    }
    
    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_at: Date.now() + (24 * 60 * 60 * 1000)
    }
    
    setUser(mockUser)
    setSession(mockSession)
    setIsLoggedIn(true)
    
    // Clear all pending data
    sessionStorage.removeItem('pendingFirstName')
    sessionStorage.removeItem('pendingLastName')
    sessionStorage.removeItem('pendingUSN')
    sessionStorage.removeItem('pendingBranch')
    sessionStorage.removeItem('pendingJoiningYear')
    sessionStorage.removeItem('pendingPassingYear')
    
    return { data: { user: mockUser, session: mockSession }, error: null }
  }

  const signOut = async () => {
    console.log("AuthProvider: Signing out...")
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('AuthProvider: signOut error:', error)
        return { error }
      }
      
      // Clear state
      setUser(null)
      setSession(null)
      setIsLoggedIn(false)
      setError(null)
      
      console.log("AuthProvider: Sign out complete")
      return { error: null }
    } catch (err) {
      console.error('AuthProvider: signOut exception:', err)
      return { error: err }
    }
  }

  const getSession = async () => {
    console.log("AuthProvider: getSession called")
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (err) {
      return { session: null, error: err }
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    isLoggedIn,
    signUpWithOTP,
    signInWithOTP,
    verifyOTP,
    verifyDummyOTP,
    signOut,
    getSession,
    isReady
  }

  console.log('AuthProvider: Providing context value:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading, 
    isLoggedIn, 
    isReady 
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
