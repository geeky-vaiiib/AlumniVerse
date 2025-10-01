"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'

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

        // Try to fetch from users table
        const { data: dbProfile, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (dbError && dbError.code !== 'PGRST116') {
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
          profileCompleted: authMetadata.profileCompleted || dbProfile?.is_profile_complete || false,
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

      // Try to fetch from users table
      const { data: dbProfile, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', freshUser.id)
        .single()

      if (dbError && dbError.code !== 'PGRST116') {
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
        profileCompleted: authMetadata.profileCompleted || dbProfile?.is_profile_complete || false,
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

      // Update database profile if exists
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          email: user.email,
          first_name: updates.firstName || userProfile?.firstName,
          last_name: updates.lastName || userProfile?.lastName,
          usn: updates.usn || userProfile?.usn,
          branch: updates.branch || userProfile?.branch,
          admission_year: updates.joiningYear || userProfile?.joiningYear,
          passing_year: updates.passingYear || userProfile?.passingYear,
          company: updates.currentCompany || userProfile?.currentCompany,
          current_position: updates.designation || userProfile?.designation,
          location: updates.location || userProfile?.location,
          linkedin_url: updates.linkedinUrl || userProfile?.linkedinUrl,
          github_url: updates.githubUrl || userProfile?.githubUrl,
          leetcode_url: updates.leetcodeUrl || userProfile?.leetcodeUrl,
          resume_url: updates.resumeUrl || userProfile?.resumeUrl,
          bio: updates.bio || userProfile?.bio,
          skills: updates.skills || userProfile?.skills,
          is_profile_complete: updates.profileCompleted || userProfile?.profileCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'auth_id'
        })

      if (dbError) {
        console.error('UserContext: Database update error:', dbError)
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

