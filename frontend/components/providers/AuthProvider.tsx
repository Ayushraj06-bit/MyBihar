'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { DEV_SESSION_COOKIE, DEV_USER, isDevAuthBypass } from '@/lib/supabase/env'

/* The account as the UI reads it — Google fills these through user_metadata. */
export type AuthUser = {
  id: string
  fullName: string | null
  email: string | null
  emailVerified: boolean
  imageUrl: string | null
  createdAt: string
}

type AuthContextValue = {
  isLoaded: boolean
  isAuthenticated: boolean | undefined
  user: AuthUser | null
  signInWithGoogle: (next?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/* the dev session, as the browser half sees it (lib/supabase/env.ts) */
const devSession = {
  read: () => document.cookie.split('; ').some((part) => part.startsWith(`${DEV_SESSION_COOKIE}=`)),
  open: () => { document.cookie = `${DEV_SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax` },
  close: () => { document.cookie = `${DEV_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax` },
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  return {
    id: user.id,
    fullName: meta.full_name || meta.name || null,
    email: user.email ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    imageUrl: meta.avatar_url || meta.picture || null,
    createdAt: user.created_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(createClient)
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let active = true
    /* `next dev` without a project: one fixed local account, no round trip. lib/supabase/env.ts */
    if (isDevAuthBypass()) {
      setUser(devSession.read() ? { ...DEV_USER } : null)
      setIsLoaded(true)
      return
    }
    /* getUser() asks Supabase, rather than trusting whatever is in the cookie */
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(toAuthUser(data.user))
      setIsLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user ?? null))
      setIsLoaded(true)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithGoogle = async (next = '/home') => {
    if (isDevAuthBypass()) {
      devSession.open()
      setUser({ ...DEV_USER })
      router.push(next)
      router.refresh()
      return
    }
    const redirectTo = new URL('/auth/callback', window.location.origin)
    redirectTo.searchParams.set('next', next)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo.toString() },
    })
    if (error) throw error
  }

  const logout = async () => {
    if (isDevAuthBypass()) {
      devSession.close()
      setUser(null)
    } else {
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isAuthenticated: isLoaded ? Boolean(user) : undefined,
        user,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
