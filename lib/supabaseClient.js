/**
 * Supabase Client Configuration for Frontend
 * Handles client-side Supabase operations with safe initialization
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper: create a safe stub client when env is missing to avoid build-time crashes
function createStubSupabase() {
  const notConfigured = (method = 'method') => async () => ({
    data: null,
    error: new Error(
      `Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local before using auth ${method}`
    )
  });

  const auth = {
    getSession: notConfigured('getSession'),
    signInWithPassword: notConfigured('signInWithPassword'),
    signUp: notConfigured('signUp'),
    signInWithOtp: notConfigured('signInWithOtp'),
    resetPasswordForEmail: notConfigured('resetPasswordForEmail'),
    updateUser: notConfigured('updateUser'),
    verifyOtp: notConfigured('verifyOtp'),
    signOut: notConfigured('signOut'),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  };

  return { auth };
}

// Create Supabase client with safe configuration
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false
      },
      global: {
        headers: {
          'X-Client-Info': 'alumniverse-frontend'
        }
      }
    })
  : createStubSupabase();

// Log status (do not throw at import time)
if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase env not found. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

/**
 * Frontend Helper Functions for Supabase Operations
 */
export const supabaseHelpers = {
  // Authentication helpers
  auth: {
    signUp: async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { data, error };
    },

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },

    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    },

    onAuthStateChange: (callback) => {
      return supabase.auth.onAuthStateChange(callback);
    },

    resetPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { data, error };
    },

    // OTP Authentication Methods
    signUpWithOTP: async (email, metadata = {}) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: metadata,
          shouldCreateUser: true
        }
      });
      return { data, error };
    },

    signInWithOTP: async (email) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      return { data, error };
    },

    verifyOTP: async (email, token) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      return { data, error };
    },

    getSession: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    }
  },

  // User profile helpers
  users: {
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    updateProfile: async (userId, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    getDirectory: async (filters = {}, pagination = {}) => {
      let query = supabase
        .from('users')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_email_verified', true);

      // Apply filters
      if (filters.branch) query = query.eq('branch', filters.branch);
      if (filters.graduationYear) query = query.eq('passing_year', filters.graduationYear);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.company) query = query.ilike('company', `%${filters.company}%`);
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,current_position.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = pagination.sortBy || 'first_name';
      const sortOrder = pagination.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
        if (pagination.offset) {
          query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
        }
      }

      const { data, error } = await query;
      return { data, error };
    }
  },

  // Jobs helpers
  jobs: {
    getAll: async (filters = {}, pagination = {}) => {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.company) query = query.ilike('company', `%${filters.company}%`);
      if (filters.experienceLevel) query = query.eq('experience_level', filters.experienceLevel);
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortOrder = pagination.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
        if (pagination.offset) {
          query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
        }
      }

      const { data, error } = await query;
      return { data, error };
    },

    create: async (jobData) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();
      return { data, error };
    },

    update: async (jobId, updates) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();
      return { data, error };
    },

    delete: async (jobId) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ is_active: false })
        .eq('id', jobId)
        .select()
        .single();
      return { data, error };
    }
  },

  // Events helpers
  events: {
    getAll: async (filters = {}, pagination = {}) => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.upcoming === 'true') query = query.gt('event_date', new Date().toISOString());
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = pagination.sortBy || 'event_date';
      const sortOrder = pagination.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
        if (pagination.offset) {
          query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
        }
      }

      const { data, error } = await query;
      return { data, error };
    },

    create: async (eventData) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      return { data, error };
    },

    registerForEvent: async (eventId, userId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, user_id: userId }])
        .select()
        .single();
      return { data, error };
    },

    unregisterFromEvent: async (eventId, userId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
      return { data, error };
    }
  },

  // Storage helpers
  storage: {
    uploadAvatar: async (userId, file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (error) return { data: null, error };
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return { data: { ...data, publicUrl }, error: null };
    },

    uploadResume: async (userId, file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/resume_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);
      
      return { data, error };
    },

    getResumeUrl: async (filePath) => {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      return { data, error };
    },

    deleteFile: async (bucket, filePath) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      return { data, error };
    }
  }
};

// Safe export with validation
export { supabase };
export default supabase;

// Validation helper for components
export const isSupabaseReady = () => {
  return !!(supabase && supabase.auth && typeof supabase.auth.getSession === 'function');
};
