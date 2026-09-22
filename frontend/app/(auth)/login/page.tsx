'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { AuthLoading, AuthStage } from '@/components/auth/AuthStage'
import { GoogleSignIn } from '@/components/auth/GoogleSignIn'
import { DevSignIn } from '@/components/auth/DevSignIn'
import { NotConfigured } from '@/components/auth/NotConfigured'
import { isDevAuthBypass, isSupabaseConfigured } from '@/lib/supabase/env'

function Login() {
  const { isAuthenticated, isLoaded } = useAuth()
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const router = useRouter()
  /* /auth/callback sends a failed code exchange back here */
  const failed = useSearchParams().get('error') === 'oauth'

  useEffect(() => {
    if (isLoaded && isAuthenticated) router.replace('/home')
  }, [isLoaded, isAuthenticated, router])

  if (!isLoaded || isAuthenticated) return <AuthLoading label="Opening the door" />

  return (
    <AuthStage
      lede={isSignUpMode ? 'Make an account and keep the city close.' : 'Sign in and pick up where you left the city.'}
      footer={<>Created with &lt;3 by Ayush Kumar Jha</>}
    >
      <div className="hb-seg hb-auth-switch" role="group" aria-label="Sign in or create an account">
        <button type="button" aria-pressed={!isSignUpMode} onClick={() => setIsSignUpMode(false)}>Sign in</button>
        <button type="button" aria-pressed={isSignUpMode} onClick={() => setIsSignUpMode(true)}>Create account</button>
      </div>

      <div className="hb-auth-form">
        {isSupabaseConfigured() ? (
          <GoogleSignIn
            label={isSignUpMode ? 'Create account with Google' : 'Sign in with Google'}
            initialError={failed ? 'That sign-in did not go through. Try again.' : null}
          />
        ) : isDevAuthBypass() ? (
          <DevSignIn />
        ) : (
          <NotConfigured />
        )}
      </div>
    </AuthStage>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading label="Opening the door" />}>
      <Login />
    </Suspense>
  )
}
