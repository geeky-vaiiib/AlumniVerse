/**
 * API Service
 * Handles all API requests to the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

class ApiService {
  /**
   * Make a request to the backend API
   * @param {string} endpoint - API endpoint (e.g., '/posts', '/jobs')
   * @param {object} options - Fetch options (method, body, headers, etc.)
   */
  async request(endpoint, options = {}) {
    const url = `${BACKEND_URL}/api${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      console.log(`📡 API Request: ${config.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        console.error(`❌ API Error (${response.status}):`, data)
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      console.log(`✅ API Success: ${endpoint}`)
      return data
    } catch (error) {
      console.error('API request failed:', endpoint, error)
      throw error
    }
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

const apiService = new ApiService()
export default apiService
