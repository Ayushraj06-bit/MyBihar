/*
 * The Supabase project the app signs in through, read once and read safely.
 * Safe to import from the browser and the server: only NEXT_PUBLIC_* values,
 * which Next inlines at build time.
 *
 * Without a project configured the app must still boot — the brand kit, the
 * ghat still and the login screen do not need one — so the clients get a
 * placeholder host that is never contacted, and the login screen says what is
 * missing instead of sending the visitor to a domain that does not resolve.
 */

const FALLBACK_URL = 'https://unconfigured.supabase.co'
const FALLBACK_KEY = 'unconfigured'

const PROJECT_URL = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
}

export function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY
}

/* A real project: a *.supabase.co URL and a key, and neither is a placeholder. */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  return PROJECT_URL.test(url) && !/placeholder|unconfigured|example/i.test(url) && key.length > 20 && !/placeholder/i.test(key)
}

/* ---------- local development without a project ---------------------------
   NEXT_PUBLIC_AUTH_DEV_BYPASS=true signs every visitor in as one fixed local
   account so the whole app can be walked through with `next dev` alone. It is
   ignored by production builds: `next build` sets NODE_ENV=production, so the
   flag cannot leak past the dev server whatever .env says.                  */

/* The dev session itself: set when signing in as the developer, cleared on
   sign-out, so the bypass behaves like a session rather than a permanent state.
   Honoured only while isDevAuthBypass() is true, so it means nothing in
   production however it was set. */
export const DEV_SESSION_COOKIE = 'hb-dev-auth'

export function isDevAuthBypass() {
  return process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production'
}

export const DEV_USER = Object.freeze({
  id: '00000000-0000-4000-8000-000000000001',
  fullName: 'Local developer',
  email: 'dev@localhost',
  emailVerified: false,
  imageUrl: null as string | null,
  createdAt: '2026-01-01T00:00:00.000Z',
})
