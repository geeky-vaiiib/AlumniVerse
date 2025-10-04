"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'
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

// Safely fetch a single users row by auth_id even if duplicates exist
const getDbProfileByAuthId = async (authId) => {
  try {
    // First try the fast path
    const { data, error, status } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()
    
    if (!error) return { data, error: null }

    // If multiple rows (406) or ambiguous result, fall back to latest by updated_at
    const isMultiple = status === 406 || (error?.message || '').toLowerCase().includes('multiple') || (error?.message || '').toLowerCase().includes('results contain')
    if (isMultiple) {
      const { data: rows, error: listError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .order('updated_at', { ascending: false, nullsLast: true })
        .limit(1)

      if (listError) return { data: null, error: listError }
      return { data: rows?.[0] || null, error: null }
    }

    return { data: null, error }
  } catch (e) {
    return { data: null, error: e }
  }
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

export function UserProvider({ children }) {
  const { user, session, isLoggedIn } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile from Supabase
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user || !isLoggedIn) {
        setUserProfile(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('UserContext: Fetching profile for user:', user.id)

        // Get user metadata from auth
        const authMetadata = user.user_metadata || {}
        
        console.log('UserContext: Auth metadata:', authMetadata)

        // Try to fetch from users table safely (handles duplicates)
        const { data: dbProfile, error: dbError } = await getDbProfileByAuthId(user.id)
        if (dbError) {
          console.error('UserContext: Database error:', dbError)
        }

        // Merge auth metadata with database profile
        const profile = {
          id: user.id,
          email: user.email,
          firstName: authMetadata.first_name || dbProfile?.first_name || '',
          lastName: authMetadata.last_name || dbProfile?.last_name || '',
          usn: authMetadata.usn || dbProfile?.usn || '',
          branch: authMetadata.branch || dbProfile?.branch || '',
          branchCode: authMetadata.branch_code || dbProfile?.branch_code || '',
          joiningYear: authMetadata.joining_year || dbProfile?.admission_year || null,
          passingYear: authMetadata.passing_year || dbProfile?.passing_year || null,
          currentCompany: authMetadata.currentCompany || dbProfile?.company || 'Not specified',
          designation: authMetadata.designation || dbProfile?.current_position || 'Not specified',
          location: authMetadata.location || dbProfile?.location || 'Not specified',
          linkedinUrl: authMetadata.linkedinUrl || dbProfile?.linkedin_url || '',
          githubUrl: authMetadata.githubUrl || dbProfile?.github_url || '',
          leetcodeUrl: authMetadata.leetcodeUrl || dbProfile?.leetcode_url || '',
          resumeUrl: authMetadata.resumeUrl || dbProfile?.resume_url || '',
          bio: authMetadata.bio || dbProfile?.bio || '',
          skills: authMetadata.skills || dbProfile?.skills || [],
          profileCompleted: authMetadata.profileCompleted || dbProfile?.profile_completed || false,
          profileCompletion: authMetadata.profileCompletion || (
            // Calculate profile completion percentage
            calculateProfileCompletion({
              firstName: authMetadata.first_name || dbProfile?.first_name || '',
              lastName: authMetadata.last_name || dbProfile?.last_name || '',
              currentCompany: authMetadata.currentCompany || dbProfile?.company || '',
              designation: authMetadata.designation || dbProfile?.current_position || '',
              location: authMetadata.location || dbProfile?.location || '',
              linkedinUrl: authMetadata.linkedinUrl || dbProfile?.linkedin_url || '',
              githubUrl: authMetadata.githubUrl || dbProfile?.github_url || '',
              bio: authMetadata.bio || dbProfile?.bio || ''
            })
          ),
          avatarUrl: dbProfile?.avatar_path || null,
          connections: 0, // Will be fetched from connections table
          profileViews: 0, // Will be fetched from analytics
          badges: [], // Will be fetched from badges table
          createdAt: dbProfile?.created_at || user.created_at,
          updatedAt: dbProfile?.updated_at || new Date().toISOString()
        }

        console.log('UserContext: Merged profile:', profile)
        setUserProfile(profile)
        setError(null)
      } catch (err) {
        console.error('UserContext: Error fetching profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, isLoggedIn])

  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user || !isLoggedIn) {
      return
    }

    try {
      console.log('UserContext: Refreshing profile data...')
      setLoading(true)

      // Get fresh user data from Supabase Auth
      const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !freshUser) {
        console.error('UserContext: Error getting fresh user:', userError)
        return
      }

      // Get user metadata from auth
      const authMetadata = freshUser.user_metadata || {}
      
      console.log('UserContext: Fresh auth metadata:', authMetadata)

      // Try to fetch from users table safely (handles duplicates)
      const { data: dbProfile, error: dbError } = await getDbProfileByAuthId(freshUser.id)
      if (dbError) {
        console.error('UserContext: Database error:', dbError)
      }

      // Merge auth metadata with database profile
      const profile = {
        id: freshUser.id,
        email: freshUser.email,
        firstName: authMetadata.first_name || dbProfile?.first_name || '',
        lastName: authMetadata.last_name || dbProfile?.last_name || '',
        usn: authMetadata.usn || dbProfile?.usn || '',
        branch: authMetadata.branch || dbProfile?.branch || '',
        branchCode: authMetadata.branch_code || dbProfile?.branch_code || '',
        joiningYear: authMetadata.joining_year || dbProfile?.admission_year || null,
        passingYear: authMetadata.passing_year || dbProfile?.passing_year || null,
        currentCompany: authMetadata.currentCompany || dbProfile?.company || 'Not specified',
        designation: authMetadata.designation || dbProfile?.current_position || 'Not specified',
        location: authMetadata.location || dbProfile?.location || 'Not specified',
        linkedinUrl: authMetadata.linkedinUrl || dbProfile?.linkedin_url || '',
        githubUrl: authMetadata.githubUrl || dbProfile?.github_url || '',
        leetcodeUrl: authMetadata.leetcodeUrl || dbProfile?.leetcode_url || '',
        resumeUrl: authMetadata.resumeUrl || dbProfile?.resume_url || '',
        bio: authMetadata.bio || dbProfile?.bio || '',
        skills: authMetadata.skills || dbProfile?.skills || [],
        profileCompleted: authMetadata.profileCompleted || dbProfile?.profile_completed || false,
        profileCompletion: authMetadata.profileCompletion || (
          calculateProfileCompletion({
            firstName: authMetadata.first_name || dbProfile?.first_name || '',
            lastName: authMetadata.last_name || dbProfile?.last_name || '',
            currentCompany: authMetadata.currentCompany || dbProfile?.company || '',
            designation: authMetadata.designation || dbProfile?.current_position || '',
            location: authMetadata.location || dbProfile?.location || '',
            linkedinUrl: authMetadata.linkedinUrl || dbProfile?.linkedin_url || '',
            githubUrl: authMetadata.githubUrl || dbProfile?.github_url || '',
            bio: authMetadata.bio || dbProfile?.bio || ''
          })
        ),
        avatarUrl: dbProfile?.avatar_path || null,
        connections: 0,
        profileViews: 0,
        badges: [],
        createdAt: dbProfile?.created_at || freshUser.created_at,
        updatedAt: dbProfile?.updated_at || new Date().toISOString()
      }

      console.log('UserContext: Refreshed profile:', profile)
      setUserProfile(profile)
      setError(null)
    } catch (err) {
      console.error('UserContext: Error refreshing profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      console.log('UserContext: Updating profile with:', updates)

      // Prevent infinite loops - check if updates are actually different
      const currentProfile = userProfile || {}
      const hasChanges = Object.keys(updates).some(key => {
        const newValue = updates[key]
        const currentValue = currentProfile[key]
        
        // Handle different types of comparisons
        if (typeof newValue === 'object' && typeof currentValue === 'object') {
          return JSON.stringify(newValue) !== JSON.stringify(currentValue)
        }
        return newValue !== currentValue
      })

      if (!hasChanges) {
        console.log('UserContext: No changes detected, skipping update')
        return { success: true }
      }

      // Update auth metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      })

      if (authError) {
        throw authError
      }

      // Update database profile with proper null handling
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          email: user.email,
          first_name: updates.firstName || userProfile?.firstName || null,
          last_name: updates.lastName || userProfile?.lastName || null,
          usn: updates.usn || userProfile?.usn || null,
          branch: updates.branch || userProfile?.branch || null,
          admission_year: updates.joiningYear || userProfile?.joiningYear || null,
          passing_year: updates.passingYear || userProfile?.passingYear || null,
          company: updates.currentCompany || userProfile?.currentCompany || null,
          current_position: updates.designation || userProfile?.designation || null,
          location: updates.location || userProfile?.location || null,
          // Handle URL fields - validate and send null instead of empty strings to satisfy CHECK constraints
          linkedin_url: validateLinkedInUrl(updates.linkedinUrl) || validateLinkedInUrl(userProfile?.linkedinUrl),
          github_url: validateGitHubUrl(updates.githubUrl) || validateGitHubUrl(userProfile?.githubUrl),
          leetcode_url: validateLeetCodeUrl(updates.leetcodeUrl) || validateLeetCodeUrl(userProfile?.leetcodeUrl),
          resume_url: (updates.resumeUrl && updates.resumeUrl.trim()) ? updates.resumeUrl.trim() : 
                     (userProfile?.resumeUrl && userProfile.resumeUrl.trim()) ? userProfile.resumeUrl.trim() : null,
          bio: updates.bio || userProfile?.bio || null,
          skills: updates.skills || userProfile?.skills || null,
          profile_completed: Boolean(updates.profileCompleted || userProfile?.profileCompleted),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'auth_id'
        })

      if (dbError) {
        console.error('UserContext: Database update error:', dbError)
        throw new Error(dbError.message || 'Failed to update user profile in database')
      }

      // Update local state only if there were actual changes
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
    
    // Fallback to email username
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

