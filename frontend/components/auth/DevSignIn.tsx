'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { DEV_USER } from '@/lib/supabase/env'

/*  The door when NEXT_PUBLIC_AUTH_DEV_BYPASS is on and there is no Supabase
    project: one fixed local account, so the whole app — including signing out
    and back in — can be walked through with `next dev` alone. Never rendered
    by a production build; lib/supabase/env.ts decides.                       */
export function DevSignIn() {
  const { signInWithGoogle } = useAuth()
  const [pending, setPending] = useState(false)

  return (
    <div className="hb-auth-card">
      <button
        type="button"
        className="hb-btn hb-btn--secondary hb-btn--block"
        disabled={pending}
        onClick={() => { setPending(true); void signInWithGoogle('/home') }}
      >
        {pending ? 'Opening the door' : `Continue as ${DEV_USER.fullName}`}
      </button>
      <p className="hb-caption">
        Development sign-in, this machine only. For real accounts, set{' '}
        <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{' '}
        and drop <code>NEXT_PUBLIC_AUTH_DEV_BYPASS</code>.
      </p>
    </div>
  )
}
