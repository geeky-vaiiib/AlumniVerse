/**
 * Alumni API Client
 * Handles all alumni-related API calls
 */

import { supabase } from '../supabaseClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

/**
 * Get alumni directory with filters and pagination
 */
export async function fetchAlumniDirectory(filters = {}) {
  try {
    const {
      search = '',
      branch = '',
      year = '',
      location = '',
      company = '',
      skills = '',
      page = 1,
      limit = 20,
      sortBy = 'first_name',
      sortOrder = 'asc'
    } = filters

    // Build query parameters
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (branch) params.append('branch', branch)
    if (year) params.append('year', year)
    if (location) params.append('location', location)
    if (company) params.append('company', company)
    if (skills) params.append('skills', skills)
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    params.append('sortBy', sortBy)
    params.append('sortOrder', sortOrder)

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}/directory?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data: data.data, error: null }

  } catch (error) {
    console.error('Error fetching alumni directory:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get alumni by ID
 */
export async function fetchAlumniById(id) {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}/directory/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data: data.data.alumni, error: null }

  } catch (error) {
    console.error('Error fetching alumni by ID:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get alumni statistics
 */
export async function fetchAlumniStats() {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}/directory/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data: data.data.stats, error: null }

  } catch (error) {
    console.error('Error fetching alumni stats:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get featured alumni
 */
export async function fetchFeaturedAlumni(limit = 6) {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}/directory/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data: data.data.featuredAlumni, error: null }

  } catch (error) {
    console.error('Error fetching featured alumni:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Connect with alumni (placeholder for future implementation)
 */
export async function connectWithAlumni(alumniId) {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      throw new Error('Authentication required')
    }

    // This would be implemented when connection functionality is added
    // For now, return a mock success response
    return { 
      data: { 
        success: true, 
        message: 'Connection request sent successfully',
        alumniId 
      }, 
      error: null 
    }

  } catch (error) {
    console.error('Error connecting with alumni:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Search alumni with advanced filters
 */
export async function searchAlumni(searchTerm, filters = {}) {
  return fetchAlumniDirectory({
    search: searchTerm,
    ...filters
  })
}

/**
 * Get alumni by branch
 */
export async function fetchAlumniByBranch(branch, options = {}) {
  return fetchAlumniDirectory({
    branch,
    ...options
  })
}

/**
 * Get alumni by graduation year
 */
export async function fetchAlumniByYear(year, options = {}) {
  return fetchAlumniDirectory({
    year,
    ...options
  })
}

/**
 * Get alumni by location
 */
export async function fetchAlumniByLocation(location, options = {}) {
  return fetchAlumniDirectory({
    location,
    ...options
  })
}

/**
 * Get alumni by company
 */
export async function fetchAlumniByCompany(company, options = {}) {
  return fetchAlumniDirectory({
    company,
    ...options
  })
}

/**
 * Get alumni by skills
 */
export async function fetchAlumniBySkills(skills, options = {}) {
  const skillsString = Array.isArray(skills) ? skills.join(',') : skills
  return fetchAlumniDirectory({
    skills: skillsString,
    ...options
  })
}
