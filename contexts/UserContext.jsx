"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/providers/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { validateGitHubUrl, validateLinkedInUrl, validateLeetCodeUrl } from '../lib/utils/urlValidation'

const UserContext = createContext()

// Calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  const fields = [
    'firstName',
    'lastName',
    'currentCompany',
    'designation',
    'location',
    'linkedinUrl',
    'githubUrl',
    'bio'
  ]

  const filledFields = fields.filter(field => profile[field] && profile[field].trim() !== '')
  return Math.round((filledFields.length / fields.length) * 100)
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

export function UserProvider({ children }) {
  const { user, userProfile: authProfile, loading: authLoading, isAuthenticated } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async () => {
    console.log("[USER_CONTEXT] fetchUserProfile triggered:", {
      hasUser: !!user,
      userId: user?.uid,
      isAuthenticated,
      hasAuthProfile: !!authProfile
    })

    if (!user || !isAuthenticated) {
      console.log("[USER_CONTEXT] No user/auth, clearing profile")
      setUserLoading(false)
      setLoading(false)
      setUserProfile(null)
      return
    }

    // Prevent repeated re-fetching for same user
    if (userProfile?.id === user.uid) {
      console.log("[USER_CONTEXT] Profile already loaded for user:", user.uid)
      setUserLoading(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setUserLoading(true)
      console.log('[USER_CONTEXT] Fetching profile for user:', user.uid)

      // Fetch from Firestore users collection
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      let dbProfile = null
      if (userDoc.exists()) {
        dbProfile = { id: userDoc.id, ...userDoc.data() }
      }

      console.log('[USER_CONTEXT] Database profile:', dbProfile)

      // Merge auth profile with database profile
      const profile = {
        id: user.uid,
        email: user.email,
        firstName: dbProfile?.firstName || authProfile?.firstName || '',
        lastName: dbProfile?.lastName || authProfile?.lastName || '',
        usn: dbProfile?.usn || '',
        branch: dbProfile?.branch || authProfile?.branch || '',
        branchCode: dbProfile?.branchCode || '',
        joiningYear: dbProfile?.admissionYear || null,
        passingYear: dbProfile?.passingYear || authProfile?.passingYear || null,
        currentCompany: dbProfile?.company || 'Not specified',
        designation: dbProfile?.currentPosition || 'Not specified',
        location: dbProfile?.location || 'Not specified',
        linkedinUrl: dbProfile?.linkedinUrl || '',
        githubUrl: dbProfile?.githubUrl || '',
        leetcodeUrl: dbProfile?.leetcodeUrl || '',
        resumeUrl: dbProfile?.resumeUrl || '',
        bio: dbProfile?.bio || '',
        skills: dbProfile?.skills || [],
        profileCompleted: dbProfile?.profileCompleted || dbProfile?.isProfileComplete || false,
        is_complete: dbProfile?.profileCompleted || dbProfile?.isProfileComplete || false,
        profileCompletion: calculateProfileCompletion({
          firstName: dbProfile?.firstName || '',
          lastName: dbProfile?.lastName || '',
          currentCompany: dbProfile?.company || '',
          designation: dbProfile?.currentPosition || '',
          location: dbProfile?.location || '',
          linkedinUrl: dbProfile?.linkedinUrl || '',
          githubUrl: dbProfile?.githubUrl || '',
          bio: dbProfile?.bio || ''
        }),
        avatarUrl: dbProfile?.avatarPath || null,
        connections: 0,
        profileViews: 0,
        badges: [],
        createdAt: dbProfile?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: dbProfile?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }

      console.log('[USER_CONTEXT] Merged profile:', profile)
      setUserProfile(profile)
      setError(null)
    } catch (err) {
      console.error('[USER_CONTEXT] Error fetching profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setUserLoading(false)
    }
  }, [user, isAuthenticated, authProfile, userProfile?.id])

  // Listen for auth changes
  useEffect(() => {
    if (!authLoading) {
      fetchUserProfile()
    }
  }, [user, authLoading, fetchUserProfile])

  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user || !isAuthenticated) {
      return
    }

    try {
      console.log('UserContext: Refreshing profile data...')
      setLoading(true)

      // Fetch fresh data from Firestore
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const dbProfile = { id: userDoc.id, ...userDoc.data() }

        const profile = {
          id: user.uid,
          email: user.email,
          firstName: dbProfile.firstName || '',
          lastName: dbProfile.lastName || '',
          usn: dbProfile.usn || '',
          branch: dbProfile.branch || '',
          branchCode: dbProfile.branchCode || '',
          joiningYear: dbProfile.admissionYear || null,
          passingYear: dbProfile.passingYear || null,
          currentCompany: dbProfile.company || 'Not specified',
          designation: dbProfile.currentPosition || 'Not specified',
          location: dbProfile.location || 'Not specified',
          linkedinUrl: dbProfile.linkedinUrl || '',
          githubUrl: dbProfile.githubUrl || '',
          leetcodeUrl: dbProfile.leetcodeUrl || '',
          resumeUrl: dbProfile.resumeUrl || '',
          bio: dbProfile.bio || '',
          skills: dbProfile.skills || [],
          profileCompleted: dbProfile.profileCompleted || dbProfile.isProfileComplete || false,
          is_complete: dbProfile.profileCompleted || dbProfile.isProfileComplete || false,
          profileCompletion: calculateProfileCompletion({
            firstName: dbProfile.firstName || '',
            lastName: dbProfile.lastName || '',
            currentCompany: dbProfile.company || '',
            designation: dbProfile.currentPosition || '',
            location: dbProfile.location || '',
            linkedinUrl: dbProfile.linkedinUrl || '',
            githubUrl: dbProfile.githubUrl || '',
            bio: dbProfile.bio || ''
          }),
          avatarUrl: dbProfile.avatarPath || null,
          connections: 0,
          profileViews: 0,
          badges: [],
          createdAt: dbProfile.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: dbProfile.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }

        console.log('UserContext: Refreshed profile:', profile)
        setUserProfile(profile)
        setError(null)
      }
    } catch (err) {
      console.error('UserContext: Error refreshing profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update user profile in Firestore
  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      console.log('UserContext: Updating profile with:', updates)

      // Check if updates are actually different
      const currentProfile = userProfile || {}
      const hasChanges = Object.keys(updates).some(key => {
        const newValue = updates[key]
        const currentValue = currentProfile[key]

        if (typeof newValue === 'object' && typeof currentValue === 'object') {
          return JSON.stringify(newValue) !== JSON.stringify(currentValue)
        }
        return newValue !== currentValue
      })

      if (!hasChanges) {
        console.log('UserContext: No changes detected, skipping update')
        return { success: true }
      }

      // Prepare Firestore update data
      const profileData = {
        authId: user.uid,
        email: user.email,
        firstName: updates.firstName || userProfile?.firstName || null,
        lastName: updates.lastName || userProfile?.lastName || null,
        usn: updates.usn || userProfile?.usn || null,
        branch: updates.branch || userProfile?.branch || null,
        admissionYear: updates.joiningYear || userProfile?.joiningYear || null,
        passingYear: updates.passingYear || userProfile?.passingYear || null,
        company: updates.currentCompany || userProfile?.currentCompany || null,
        currentPosition: updates.designation || userProfile?.designation || null,
        location: updates.location || userProfile?.location || null,
        linkedinUrl: validateLinkedInUrl(updates.linkedinUrl) || validateLinkedInUrl(userProfile?.linkedinUrl) || null,
        githubUrl: validateGitHubUrl(updates.githubUrl) || validateGitHubUrl(userProfile?.githubUrl) || null,
        leetcodeUrl: validateLeetCodeUrl(updates.leetcodeUrl) || validateLeetCodeUrl(userProfile?.leetcodeUrl) || null,
        resumeUrl: updates.resumeUrl?.trim() || userProfile?.resumeUrl?.trim() || null,
        bio: updates.bio || userProfile?.bio || null,
        skills: updates.skills || userProfile?.skills || [],
        profileCompleted: Boolean(updates.profileCompleted || userProfile?.profileCompleted),
        isProfileComplete: Boolean(updates.profileCompleted || userProfile?.profileCompleted),
        updatedAt: serverTimestamp()
      }

      // Update Firestore document
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        await updateDoc(userRef, profileData)
      } else {
        await setDoc(userRef, {
          ...profileData,
          createdAt: serverTimestamp()
        })
      }

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      }))

      console.log('UserContext: Profile updated successfully')
      return { success: true }
    } catch (err) {
      console.error('UserContext: Update error:', err)
      throw err
    }
  }

  // Get full name
  const getFullName = () => {
    if (!userProfile) return 'User'

    const firstName = userProfile.firstName || ''
    const lastName = userProfile.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim()

    if (fullName) return fullName

    if (userProfile.email) {
      return userProfile.email.split('@')[0]
    }

    return 'User'
  }

  // Get initials
  const getInitials = () => {
    const fullName = getFullName()
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const value = {
    userProfile,
    loading,
    userLoading,
    error,
    updateProfile,
    refreshProfile,
    getFullName,
    getInitials,
    isProfileComplete: userProfile?.profileCompleted || false
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
