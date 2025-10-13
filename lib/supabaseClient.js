/**
 * ⚠️ DEPRECATED: Use /lib/supabase-singleton.js instead
 * 
 * This file now re-exports from the singleton to maintain backward compatibility
 * while preventing multiple Supabase client instances.
 * 
 * Migration Guide:
 * OLD: import { supabase } from '@/lib/supabaseClient'
 * NEW: import { getSupabaseClient } from '@/lib/supabase-singleton'
 *      const supabase = getSupabaseClient()
 */

import { getSupabaseClient } from './supabase-singleton';

// Export singleton instance for backward compatibility
export const supabase = getSupabaseClient();

// Log deprecation warning
if (typeof window !== 'undefined') {
  console.warn(
    '⚠️ [DEPRECATED] Importing from /lib/supabaseClient is deprecated. ' +
    'Please import from /lib/supabase-singleton instead.'
  );
}

// Re-export helpers for backward compatibility
export const supabaseHelpers = {
  auth: {
    signUp: async (email, password, metadata = {}) => {
      const supabase = getSupabaseClient();
      return supabase.auth.signUp({ email, password, options: { data: metadata } });
    },
    signIn: async (email, password) => {
      const supabase = getSupabaseClient();
      return supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      const supabase = getSupabaseClient();
      return supabase.auth.signOut();
    },
    getCurrentUser: async () => {
      const supabase = getSupabaseClient();
      return supabase.auth.getUser();
    },
    getSession: async () => {
      const supabase = getSupabaseClient();
      return supabase.auth.getSession();
    }
  }
};

export const isSupabaseReady = () => {
  const supabase = getSupabaseClient();
  return !!(supabase && supabase.auth && typeof supabase.auth.getSession === 'function');
};

export default supabase;
