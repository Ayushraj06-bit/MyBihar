import type { ReactNode } from 'react'
import { Sprig } from './mithila'

type SectionHeadProps = {
  title: ReactNode
  id?: string
  /* Devanagari only where the English heading is a transliteration of it. §4.3 */
  devanagari?: string
  lede?: ReactNode
  action?: ReactNode
  level?: 1 | 2
  className?: string
}

/* The sprig does the job an eyebrow label would — there are no ALL-CAPS kickers. */
export function SectionHead({ title, id, devanagari, lede, action, level = 2, className = '' }: SectionHeadProps) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <header className={className}>
      <div className="hb-band-head hb-band-head--split">
        <div className="hb-band-head-title">
          <Sprig size={level === 1 ? 46 : 38} />
          <Heading id={id} className="hb-h1">
            {title}
            {devanagari && <span className="hb-hi" lang="hi" style={{ fontSize: '0.46em', marginLeft: 16 }}>{devanagari}</span>}
          </Heading>
        </div>
        {action}
      </div>
      {lede && <p className="hb-lede">{lede}</p>}
    </header>
  )
}
