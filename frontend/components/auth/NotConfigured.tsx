/*  What the sign-in card shows when there is no Supabase project behind it —
    instead of a Google button that would leave for a host that does not exist.
    Only ever seen by whoever is running the app; lib/supabase/env.ts decides. */
export function NotConfigured() {
  return (
    <div className="hb-auth-card" role="status">
      <p className="hb-body">Sign-in isn&apos;t set up on this copy yet.</p>
      <p className="hb-caption">
        Accounts live in a Supabase project. Put its URL and publishable key in{' '}
        <code>frontend/.env.local</code> as <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, with Google enabled under Authentication.
      </p>
      <p className="hb-caption">
        To look around without one, set <code>NEXT_PUBLIC_AUTH_DEV_BYPASS=true</code> and restart{' '}
        <code>npm run dev</code>.
      </p>
    </div>
  )
}
