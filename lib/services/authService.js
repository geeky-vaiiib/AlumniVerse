/**
 * Authentication Service for Supabase
 * Handles signup, login, and profile creation
 */

import { createClient } from '../supabase/client'
import { validateSignupData, parseInstitutionalEmail } from '../utils/emailParser'

/**
 * Signs up a new user with email and password
 * @param {Object} userData - User data including email, password, firstName, lastName
 * @returns {Object} - Result with success status and data/error
 */
export async function signUpUser(userData) {
  try {
    const supabase = createClient()
    
    // Validate form data
    const validation = validateSignupData(userData)
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }
    }

    const { email, password, firstName, lastName } = userData
    const { parsedData } = validation

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists'
      }
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          usn: parsedData.usn,
          branch: parsedData.branch,
          joining_year: parsedData.joiningYear,
          passing_year: parsedData.passingYear
        }
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return {
        success: false,
        error: authError.message
      }
    }

    // If user was created successfully, create profile
    if (authData.user) {
      const profileResult = await createUserProfile(authData.user, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        ...parsedData
      })

      if (!profileResult.success) {
        // If profile creation fails, we should clean up the auth user
        // But Supabase doesn't allow deleting users from client side
        console.error('Profile creation failed:', profileResult.error)
        return {
          success: false,
          error: 'Account created but profile setup failed. Please contact support.'
        }
      }

      return {
        success: true,
        data: {
          user: authData.user,
          profile: profileResult.data,
          needsEmailVerification: !authData.user.email_confirmed_at
        }
      }
    }

    return {
      success: false,
      error: 'Failed to create account'
    }

  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during signup'
    }
  }
}

/**
 * Creates user profile in the users table
 * @param {Object} authUser - Supabase auth user object
 * @param {Object} profileData - Profile data to insert
 * @returns {Object} - Result with success status and data/error
 */
async function createUserProfile(authUser, profileData) {
  try {
    const supabase = createClient()

    const profile = {
      auth_id: authUser.id,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      usn: profileData.usn,
      branch: profileData.branch,
      admission_year: profileData.joiningYear,
      passing_year: profileData.passingYear,
      is_email_verified: false,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .insert([profile])
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data
    }

  } catch (error) {
    console.error('Profile creation error:', error)
    return {
      success: false,
      error: 'Failed to create user profile'
    }
  }
}

/**
 * Signs in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - Result with success status and data/error
 */
export async function signInUser(email, password) {
  try {
    const supabase = createClient()

    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      }
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (authError) {
      console.error('Sign in error:', authError)
      return {
        success: false,
        error: authError.message
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return {
        success: false,
        error: 'Failed to load user profile'
      }
    }

    return {
      success: true,
      data: {
        user: authData.user,
        profile,
        session: authData.session
      }
    }

  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during sign in'
    }
  }
}

/**
 * Signs out the current user
 * @returns {Object} - Result with success status
 */
export async function signOutUser() {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'Failed to sign out'
    }
  }
}

/**
 * Gets the current user session
 * @returns {Object} - Current session data
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Get session error:', error)
      return null
    }

    if (!session) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()

    return {
      user: session.user,
      profile,
      session
    }

  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
