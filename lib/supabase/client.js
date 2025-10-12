/**
 * Supabase Client for Client Components
 * Uses the new @supabase/ssr package for better SSR support
 * 
 * ✅ CRITICAL: This client has session persistence enabled
 * to prevent redirect loops after login
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,          // ✅ CRITICAL: Persist session in localStorage
        autoRefreshToken: true,         // ✅ Auto refresh tokens before expiry
        detectSessionInUrl: true,       // ✅ Detect auth redirects from email links
        flowType: 'pkce',              // ✅ Use PKCE flow for security
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-flcgwqlabywhoulqalaz-auth-token', // ✅ Use project-specific key
      },
      global: {
        headers: {
          'X-Client-Info': 'alumniverse-web-app'
        }
      }
    }
  )
}
