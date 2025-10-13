/**
 * Supabase Client for Client Components (SSR)
 * Now uses singleton to prevent multiple instances
 */

import { getSupabaseClient } from '../supabase-singleton'

export function createClient() {
  return getSupabaseClient()
}

export default createClient
