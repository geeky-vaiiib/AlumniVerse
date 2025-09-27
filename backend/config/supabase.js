/**
 * Supabase Configuration
 * Handles Supabase client initialization and database operations
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env file');
}

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Database Helper Functions for Supabase
 */
const supabaseHelpers = {
  // User operations
  users: {
    findByEmail: async (email) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_deleted', false)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findByAuthId: async (authId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .eq('is_deleted', false)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Admin create - bypasses RLS for server-side operations
    adminCreate: async (userData) => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Admin update - bypasses RLS for server-side operations
    adminUpdate: async (id, updateData) => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Admin find by auth ID - bypasses RLS
    adminFindByAuthId: async (authId) => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .eq('is_deleted', false)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    update: async (id, updateData) => {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getAll: async (filters = {}, pagination = {}) => {
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
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,current_position.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
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
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .update({ is_deleted: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Job operations
  jobs: {
    findById: async (id) => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (jobData) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id, updateData) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getAll: async (filters = {}, pagination = {}) => {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .or('deadline.is.null,deadline.gt.now()'); // Filter out expired jobs

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
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },

  // Event operations
  events: {
    findById: async (id) => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (eventData) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id, updateData) => {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

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
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Event attendee operations
    addAttendee: async (eventId, userId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    removeAttendee: async (eventId, userId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getAttendees: async (eventId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          users:user_id (
            id,
            first_name,
            last_name,
            company,
            current_position
          )
        `)
        .eq('event_id', eventId);
      
      if (error) throw error;
      return data;
    },

    isUserAttending: async (eventId, userId) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      
      return !error && data;
    }
  },

  // Badge operations
  badges: {
    findById: async (id) => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (badgeData) => {
      const { data, error } = await supabase
        .from('badges')
        .insert([badgeData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('awarded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getLeaderboard: async (filters = {}, limit = 50) => {
      let query = supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          company,
          current_position,
          passing_year,
          branch,
          badges:badges!user_id (
            points
          )
        `)
        .eq('is_deleted', false)
        .eq('is_email_verified', true)
        .limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      // Calculate total points and sort
      const leaderboard = data.map(user => ({
        ...user,
        total_points: user.badges.reduce((sum, badge) => sum + (badge.points || 0), 0),
        total_badges: user.badges.length
      })).sort((a, b) => b.total_points - a.total_points);

      return leaderboard;
    }
  },

  // File storage operations
  storage: {
    uploadFile: async (bucket, path, file) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      return data;
    },

    deleteFile: async (bucket, path) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
      return data;
    },

    getPublicUrl: (bucket, path) => {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return data.publicUrl;
    },

    createSignedUrl: async (bucket, path, expiresIn = 3600) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      return data.signedUrl;
    }
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseHelpers
};
