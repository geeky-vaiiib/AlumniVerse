/**
 * API Service for AlumniVerse Frontend
 * Handles all API calls with proper error handling and authentication
 */

import { getSupabaseClient } from '@/lib/supabase-singleton'

const supabase = getSupabaseClient()

class ApiService {
  constructor() {
    this.baseURL = '/api'; // Use Next.js API routes
  }

  // Helper method for making authenticated API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get current session for authentication
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${endpoint}`, errorText);
        throw new Error(`Invalid or expired token`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Posts/Newsfeed API
  posts = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/newsfeed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.request(endpoint);
    },

    getById: async (id) => {
      return this.request(`/newsfeed/${id}`);
    },

    create: async (postData) => {
      return this.request('/newsfeed', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },

    update: async (id, postData) => {
      return this.request(`/newsfeed/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
    },

    delete: async (id) => {
      return this.request(`/newsfeed/${id}`, {
        method: 'DELETE',
      });
    },

    toggleLike: async (id) => {
      return this.request(`/newsfeed/${id}/like`, {
        method: 'POST',
      });
    },
  };

  // Jobs API
  jobs = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.request(endpoint);
    },

    getById: async (id) => {
      return this.request(`/jobs/${id}`);
    },

    create: async (jobData) => {
      return this.request('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
    },

    update: async (id, jobData) => {
      return this.request(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
    },

    delete: async (id) => {
      return this.request(`/jobs/${id}`, {
        method: 'DELETE',
      });
    },

    apply: async (id, applicationData) => {
      return this.request(`/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
    },
  };

  // Events API
  events = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.request(endpoint);
    },

    getById: async (id) => {
      return this.request(`/events/${id}`);
    },

    create: async (eventData, token) => {
      return this.request('/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
    },

    register: async (id, token) => {
      return this.request(`/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  };

  // Directory API
  directory = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/directory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.request(endpoint);
    },

    getById: async (id) => {
      return this.request(`/directory/${id}`);
    },

    getStats: async () => {
      return this.request('/directory/stats');
    },

    getFeatured: async () => {
      return this.request('/directory/featured');
    },
  };

  // Authentication API
  auth = {
    signup: async (userData) => {
      return this.request('/supabase-auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    signin: async (credentials) => {
      return this.request('/supabase-auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    signout: async (token) => {
      return this.request('/supabase-auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getProfile: async (token) => {
      return this.request('/supabase-auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    forgotPassword: async (email) => {
      return this.request('/supabase-auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  };

  // Storage API
  storage = {
    uploadAvatar: async (file, token) => {
      const formData = new FormData();
      formData.append('avatar', file);

      return this.request('/storage/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    },

    uploadResume: async (file, token) => {
      const formData = new FormData();
      formData.append('resume', file);

      return this.request('/storage/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    },

    getInfo: async () => {
      return this.request('/storage/info');
    },
  };

  // Health check
  health = async () => {
    return this.request('/health');
  };
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual services for convenience
export const { posts, jobs, events, directory, auth, storage, health } = apiService;
