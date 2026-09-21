'use client'

import { useCallback, useEffect, useState } from 'react'
import { MedallionBloom } from '@/components/brand/MedallionBloom'

const KEY = 'mk-entry-card-1'
const HOLD_MS = 2600

/* storage can be blocked (private mode, site data off) — the card never takes /home down with it */
function hasSeen() {
  try {
    return sessionStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {}
}

/*  The title card. Once a session, on the way in: the medallion blooms over the
    ghat photograph, the wordmark lands, and the card lets go by itself. There
    is no film — a still, held, is the cinematic move here. design.md §9.8      */
export function HomeEntry() {
  const [show, setShow] = useState(false)
  const [out, setOut] = useState(false)

  const dismiss = useCallback(() => {
    markSeen()
    setOut(true)
  }, [])

  useEffect(() => {
    if (hasSeen()) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      markSeen()
      return
    }
    setShow(true)
  }, [])

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(dismiss, HOLD_MS)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [show, dismiss])

  if (!show) return null

  return (
    <div
      className={`mk-entry${out ? ' is-out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to My Bihar"
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && out) setShow(false)
      }}
    >
      <div className="mk-entry-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mk-entry-still" src="/chhath.jpg" alt="" />
        <div className="mk-entry-scrim" aria-hidden="true" />
        <div className="mk-entry-lockup">
          <MedallionBloom size={112} />
          <p className="mk-entry-latin">MY BIHAR</p>
          <p className="mk-entry-hi" lang="hi">हमार बिहार</p>
        </div>
      </div>
      <button type="button" className="mk-entry-skip" onClick={dismiss}>
        Skip
      </button>
    </div>
  )
}
