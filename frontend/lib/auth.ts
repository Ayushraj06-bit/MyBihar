import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEV_SESSION_COOKIE, DEV_USER, isDevAuthBypass } from '@/lib/supabase/env'

/*
 * Who is signed in, decided next to the thing being protected. proxy.ts only
 * refreshes the session cookie — it gates nothing — so every page under
 * app/(main) and every route handler that writes calls one of these itself.
 * tests/authBoundary.test.mjs keeps that true as routes are added.
 *
 * getClaims() verifies the JWT signature; getSession() would trust the cookie.
 */

/* Route handlers: the caller answers 401 itself rather than redirecting a fetch. */
export async function currentUserId(): Promise<string | null> {
  /* `next dev` without a Supabase project — see lib/supabase/env.ts */
  if (isDevAuthBypass()) {
    return (await cookies()).get(DEV_SESSION_COOKIE) ? DEV_USER.id : null
  }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims.sub) return null
  return data.claims.sub
}

/* Pages and Server Functions: a signed-out visitor is sent to /login. */
export async function requireUser(): Promise<string> {
  const userId = await currentUserId()
  if (!userId) redirect('/login')
  return userId
}
