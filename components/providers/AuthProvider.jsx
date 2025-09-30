"use client"

import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  // Simple dummy authentication state - NO Supabase dependencies
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false) // Always false to prevent infinite loading
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isReady, setIsReady] = useState(true) // Always ready for dummy mode

  console.log('AuthProvider: Rendering with state:', { loading, isLoggedIn, hasUser: !!user, hasSession: !!session })

  // Simple initialization - check for existing dummy auth
  useEffect(() => {
    console.log('AuthProvider: Initialization started')
    
    // Check for existing dummy auth cookie
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const dummyAuthCookie = cookies.find(cookie => 
        cookie.trim().startsWith('dummy-auth-verified=true')
      )
      
      if (dummyAuthCookie) {
        console.log('AuthProvider: Found existing dummy auth, restoring session')
        
        const mockUser = {
          id: 'dummy-user-existing',
          email: 'verified@example.com',
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { verified: true, verification_method: 'dummy_otp' }
        }
        
        const mockSession = {
          user: mockUser,
          access_token: 'dummy-access-token',
          refresh_token: 'dummy-refresh-token',
          expires_at: Date.now() + (24 * 60 * 60 * 1000),
          token_type: 'bearer'
        }
        
        setUser(mockUser)
        setSession(mockSession)
        setIsLoggedIn(true)
      }
    }
    
    console.log('AuthProvider: Initialization complete')
  }, [])

  // Dummy authentication methods
  const signUpWithOTP = async (email, metadata = {}) => {
    console.log('AuthProvider: Dummy signUpWithOTP called', { email, metadata })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { 
      data: { user: null, session: null }, 
      error: null 
    }
  }

  const signInWithOTP = async (email) => {
    console.log('AuthProvider: Dummy signInWithOTP called', { email })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { 
      data: { user: null, session: null }, 
      error: null 
    }
  }

  const verifyOTP = async (email, token) => {
    console.log('AuthProvider: verifyOTP called - redirecting to dummy verification')
    return await verifyDummyOTP(token)
  }

  const verifyDummyOTP = async (code) => {
    console.log("AuthProvider: Dummy OTP verification started for code:", code)

    // Validate that code is exactly 6 digits
    if (!code || code.length !== 6) {
      console.log("AuthProvider: Invalid OTP code length:", code?.length)
      return {
        data: null,
        error: { message: 'Please enter a valid 6-digit code' }
      }
    }

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create mock user session
      const mockUser = {
        id: 'dummy-user-' + Date.now(),
        email: 'verified@example.com',
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { verified: true, verification_method: 'dummy_otp' }
      }

      const mockSession = {
        user: mockUser,
        access_token: 'dummy-access-token',
        refresh_token: 'dummy-refresh-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000),
        token_type: 'bearer'
      }

      // Set cookie for middleware bypass
      if (typeof document !== 'undefined') {
        document.cookie = 'dummy-auth-verified=true; path=/; max-age=86400'
        console.log("AuthProvider: Dummy auth cookie set")
      }

      // Update state
      setUser(mockUser)
      setSession(mockSession)
      setIsLoggedIn(true)
      setError(null)

      console.log("AuthProvider: Dummy OTP verification successful")

      return {
        data: { user: mockUser, session: mockSession },
        error: null
      }
    } catch (error) {
      console.error('AuthProvider: Error in verifyDummyOTP:', error)
      return { data: null, error: { message: 'Verification failed. Please try again.' } }
    }
  }

  const signOut = async () => {
    console.log("AuthProvider: Signing out...")
    
    // Clear state
    setUser(null)
    setSession(null)
    setIsLoggedIn(false)
    setError(null)
    
    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'dummy-auth-verified=; path=/; max-age=0'
    }
    
    console.log("AuthProvider: Sign out complete")
    return { error: null }
  }

  const getSession = async () => {
    console.log("AuthProvider: getSession called")
    return { session, error: null }
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
