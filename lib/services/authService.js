/**
 * Authentication Service for Supabase
 * Handles signup, login, and profile creation
 */

import { createClient } from '../supabase/client'
import { validateSignupData, parseInstitutionalEmail } from '../utils/emailParser'

/**
 * Signs up a new user with email and password using server-side endpoint
 * @param {Object} userData - User data including email, password, firstName, lastName
 * @returns {Object} - Result with success status and data/error
 */
export async function signUpUser(userData) {
  try {
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

    // Call server-side signup endpoint (uses service role for atomic operation)
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        password
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Server signup error:', result)
      return {
        success: false,
        error: result.message || 'Signup failed'
      }
    }

    if (result.success) {
      return {
        success: true,
        data: {
          user: result.data.user,
          needsEmailVerification: !result.data.user.isEmailVerified
        }
      }
    }

    return {
      success: false,
      error: result.message || 'Signup failed'
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
 * Signs in a user with email and password using server-side endpoint
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - Result with success status and data/error
 */
export async function signInUser(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      }
    }

    // Call server-side signin endpoint
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Server signin error:', result)
      return {
        success: false,
        error: result.message || 'Sign in failed'
      }
    }

    if (result.success) {
      return {
        success: true,
        data: {
          user: result.data.user,
          profile: result.data.user, // The backend returns combined user data
          session: result.data.session
        }
      }
    }

    return {
      success: false,
      error: result.message || 'Sign in failed'
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
 * Gets the current user session and profile
 * @returns {Object} - Current session data with profile
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

    // For now, return the session data
    // In the future, we could call a backend endpoint to get enriched profile data
    return {
      user: session.user,
      profile: session.user.user_metadata || {},
      session
    }

  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
