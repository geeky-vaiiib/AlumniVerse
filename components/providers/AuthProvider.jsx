'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const AuthContext = createContext({})

// Check if we're in development mode
const IS_DEV = process.env.NODE_ENV === 'development'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch or create user profile in Firestore
  const fetchOrCreateProfile = useCallback(async (firebaseUser, additionalData = {}) => {
    if (!firebaseUser) return null

    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const profileData = { id: userDoc.id, ...userDoc.data() }
        setUserProfile(profileData)
        return profileData
      } else {
        // Create new profile
        const newProfile = {
          authId: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: additionalData.firstName || additionalData.first_name || '',
          lastName: additionalData.lastName || additionalData.last_name || '',
          branch: additionalData.branch || '',
          passingYear: additionalData.passingYear || additionalData.passing_year || null,
          usn: additionalData.usn || '',
          isEmailVerified: firebaseUser.emailVerified,
          isProfileComplete: false,
          isDeleted: false,
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        await setDoc(userRef, newProfile)
        const createdProfile = { id: firebaseUser.uid, ...newProfile }
        setUserProfile(createdProfile)
        return createdProfile
      }
    } catch (err) {
      console.warn('Firestore error (will use basic profile):', err.message)

      // If Firestore is offline, create a basic profile from auth data
      // This allows the auth flow to continue
      const basicProfile = {
        id: firebaseUser.uid,
        authId: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: additionalData.firstName || additionalData.first_name || '',
        lastName: additionalData.lastName || additionalData.last_name || '',
        isEmailVerified: firebaseUser.emailVerified,
        isProfileComplete: false,
        _offlineMode: true // Flag to indicate this is a fallback profile
      }
      setUserProfile(basicProfile)
      return basicProfile
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)

      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchOrCreateProfile(firebaseUser)
      } else {
        setUser(null)
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [fetchOrCreateProfile])

  // Sign up with OTP (dev mode: uses local API)
  const signUpWithOTP = async (email, userData = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Use dev OTP API
      const response = await fetch('/api/auth/dev-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userData })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // Store email for verification
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email)
        window.localStorage.setItem('pendingUserData', JSON.stringify(userData))
      }

      console.log('🔐 OTP sent - check terminal for code')

      return {
        success: true,
        message: 'OTP sent to terminal (dev mode)'
      }
    } catch (err) {
      console.error('SignUp OTP error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with OTP (dev mode: uses local API)
  const signInWithOTP = async (email) => {
    setLoading(true)
    setError(null)

    try {
      // Use dev OTP API
      const response = await fetch('/api/auth/dev-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // Store email for verification
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email)
      }

      console.log('🔐 OTP sent - check terminal for code')

      return {
        success: true,
        message: 'OTP sent to terminal (dev mode)'
      }
    } catch (err) {
      console.error('SignIn OTP error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP (dev mode: validates against local API)
  const verifyOTP = async (email, otp, userData = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Verify OTP via dev API
      const response = await fetch(`/api/auth/dev-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
      const data = await response.json()

      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Invalid OTP')
      }

      console.log('✅ OTP verified successfully')

      // Get pending user data
      const pendingData = typeof window !== 'undefined'
        ? window.localStorage.getItem('pendingUserData')
        : null
      const additionalData = pendingData ? JSON.parse(pendingData) : userData

      // Clean up storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn')
        window.localStorage.removeItem('pendingUserData')
      }

      // Return success - the user should already be signed in via password
      // This OTP is just for email verification
      return {
        success: true,
        user: auth.currentUser,
        userData: additionalData
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with password
  const signUpWithPassword = async (email, password, userData = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await fetchOrCreateProfile(result.user, userData)

      return {
        success: true,
        user: result.user
      }
    } catch (err) {
      console.error('SignUp password error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with password
  const signInWithPassword = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await fetchOrCreateProfile(result.user)

      return {
        success: true,
        user: result.user
      }
    } catch (err) {
      console.error('SignIn password error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    setLoading(true)
    setError(null)

    try {
      await sendPasswordResetEmail(auth, email)
      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    setLoading(true)
    setError(null)

    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in')
      }

      await firebaseUpdatePassword(auth.currentUser, newPassword)
      return {
        success: true,
        message: 'Password updated successfully'
      }
    } catch (err) {
      console.error('Update password error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Get ID token for API calls
  const getIdToken = async () => {
    if (!auth.currentUser) return null
    try {
      return await auth.currentUser.getIdToken()
    } catch (err) {
      console.error('Get ID token error:', err)
      return null
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUpWithOTP,
    signInWithOTP,
    verifyOTP,
    signUpWithPassword,
    signInWithPassword,
    resetPassword,
    updatePassword,
    signOut,
    getIdToken,
    refreshProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
