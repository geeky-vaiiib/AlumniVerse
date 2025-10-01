/**
 * API Service for AlumniVerse Frontend
 * Handles all backend API calls with proper error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Posts API
  posts = {
    getAll: async (filters = {}, token) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getById: async (id, token) => {
      return this.request(`/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    create: async (postData, token) => {
      return this.request('/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
    },

    update: async (id, postData, token) => {
      return this.request(`/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
    },

    delete: async (id, token) => {
      return this.request(`/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    toggleLike: async (id, token) => {
      return this.request(`/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

    create: async (jobData, token) => {
      return this.request('/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
    },

    update: async (id, jobData, token) => {
      return this.request(`/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
    },

    delete: async (id, token) => {
      return this.request(`/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    apply: async (id, applicationData, token) => {
      return this.request(`/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
