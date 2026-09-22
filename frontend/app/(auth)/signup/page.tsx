'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { AuthLoading, AuthStage } from '@/components/auth/AuthStage'
import { GoogleSignIn } from '@/components/auth/GoogleSignIn'
import { NotConfigured } from '@/components/auth/NotConfigured'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export default function SignUpPage() {
  const { isAuthenticated, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isAuthenticated) router.replace('/home')
  }, [isLoaded, isAuthenticated, router])

  if (!isLoaded || isAuthenticated) return <AuthLoading label="Opening the door" />

  return (
    <AuthStage lede="Make an account with Google. It takes a minute.">
      <div className="hb-auth-form">
        {isSupabaseConfigured() ? <GoogleSignIn label="Create account with Google" /> : <NotConfigured />}
      </div>
      <p className="hb-caption hb-auth-foot">
        <span>Already have an account?</span>
        <Link href="/login" className="hb-btn hb-btn--text">Sign in instead</Link>
      </p>
    </AuthStage>
  )
}
