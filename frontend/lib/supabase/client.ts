import { createBrowserClient } from '@supabase/ssr'
import { supabaseKey, supabaseUrl } from './env'

/* The browser half of the session. Cookies, not localStorage, so the server sees it too. */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseKey())
}
