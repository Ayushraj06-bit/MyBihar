'use client'

import { useEffect, useId, useRef, useState } from 'react'

/* ------------------------------------------------------------ aripan rule -- */
/*  A hairline in Ash that spends its last stretch becoming a curl — the vine
    that runs along the edge of an aripan, the rice-paste floor drawing of a
    Mithila courtyard. Draws itself once when it enters the viewport. design.md §6 */

export function AripanRule({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`mk-rule-wrap ${className}`} ref={ref} aria-hidden="true">
      <svg className={`mk-rule ${seen ? 'is-drawn' : ''}`} viewBox="0 0 600 44" preserveAspectRatio="none" fill="none">
        <path className="mk-rule-line" pathLength="100" stroke="var(--mk-ash)" strokeWidth="1.25" strokeLinecap="round"
          d="M0 22 L452 22 C486 22 496 22 506 12 C516 2 536 4 543 15 C550 26 543 38 531 38 C521 38 515 30 519 24" />
      </svg>
    </div>
  )
}

/* ----------------------------------------------------------- load state -- */
/*  The line drawing itself is the loading indicator. There are no spinners.   */

export function AripanLoader({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`mk-loader ${className}`} role="status">
      <svg className="mk-loader-art" viewBox="0 0 160 44" fill="none" aria-hidden="true">
        <path className="mk-loader-line" pathLength="100" stroke="var(--mk-ash)" strokeWidth="1.5" strokeLinecap="round"
          d="M2 22 L100 22 C122 22 128 22 134 14 C140 6 152 8 155 17 C158 26 153 36 144 36 C137 36 133 30 136 25" />
      </svg>
      <span className="mk-loader-label">{label}</span>
    </div>
  )
}

/* ---------------------------------------------------------- mithila border -- */
/*  The double-ruled border of a Madhubani painting — two red lines with a run
    of small arches between them — reduced to a band edge. Once or twice a
    page, as an edge. Never as a frame.                                        */

export function MithilaBorder({ height = 22 }: { height?: number }) {
  const pid = useId().replace(/:/g, '')           /* unique per instance */
  const mid = height / 2
  return (
    <div className="mk-mithila-border" aria-hidden="true">
      {/* No viewBox: units are px, so the arches tile at a fixed size at any width. */}
      <svg className="mk-mithila-border-art" width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <pattern id={pid} width="18" height={height} patternUnits="userSpaceOnUse">
            <path d={`M4 ${mid + 4} q0 -7 5 -7 t5 7`} fill="none" stroke="var(--mk-ruby)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="var(--mk-pearl)" />
        <rect width="100%" height={height} fill={`url(#${pid})`} />
        <rect width="100%" height="1.6" y="3" fill="var(--mk-ruby)" />
        <rect width="100%" height="1.6" y={height - 4.6} fill="var(--mk-ruby)" />
      </svg>
    </div>
  )
}
