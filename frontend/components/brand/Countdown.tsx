'use client'

import { useEffect, useState } from 'react'
import { NAHAY_KHAY, CHHATH_DAYS, formatChhathDate } from '@/lib/chhath'
import { GhatScene } from '@/components/brand/Ghat'

type Left = { d: number; h: number; m: number; s: number; done: boolean }

export function useCountdown(iso: string) {
  const [left, setLeft] = useState<Left | null>(null)   /* null until mounted — keeps SSR stable */
  useEffect(() => {
    const target = new Date(iso).getTime()
    const tick = () => {
      const ms = target - Date.now()
      if (ms <= 0) return setLeft({ d: 0, h: 0, m: 0, s: 0, done: true })
      setLeft({
        d: Math.floor(ms / 86400000),
        h: Math.floor(ms / 3600000) % 24,
        m: Math.floor(ms / 60000) % 60,
        s: Math.floor(ms / 1000) % 60,
        done: false,
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [iso])
  return left
}

export function CountdownScene() {
  const left = useCountdown(NAHAY_KHAY)
  const pad = (n: number) => String(n).padStart(2, '0')
  const units = left
    ? [[String(left.d), 'days'], [pad(left.h), 'hours'], [pad(left.m), 'minutes'], [pad(left.s), 'seconds']]
    : [['--', 'days'], ['--', 'hours'], ['--', 'minutes'], ['--', 'seconds']]

  return (
    <div className="hb-count-scene">
      <GhatScene />
      <div className="hb-count-scrim" aria-hidden="true" />
      <div className="hb-count-copy">
        <p className="hb-count-hi" lang="hi">छठ में घरे आ रहल बाड़ऽ नू?</p>
        <p className="hb-count-home">Welcome home.</p>
        <div className="hb-count-clock" role="timer" aria-live="off">
          {units.map(([v, label]) => (
            <div className="hb-unit" key={label}>
              <span className="hb-unit-num">{v}</span>
              <span className="hb-unit-label">{label}</span>
            </div>
          ))}
        </div>
        <p className="hb-count-sub">
          {left?.done
            ? 'Nahay Khay has come. The ghats are ready.'
            : 'till Nahay Khay, 13 November. The ghats have already started getting ready.'}
        </p>
      </div>
    </div>
  )
}

export function ChhathDays({ className = '' }: { className?: string }) {
  return (
    <ol className={`hb-count-days ${className}`}>
      {CHHATH_DAYS.map((d) => (
        <li className="hb-count-day" key={d.en}>
          <span className="hb-count-day-hi" lang="hi">{d.hi}</span>
          <span className="hb-count-day-en">{d.en}</span>
          <span className="hb-count-day-date">{formatChhathDate(d.iso)}</span>
        </li>
      ))}
    </ol>
  )
}
