import Link from 'next/link'
import type { ReactNode } from 'react'
import { Sprig } from './mithila'
import { CityIcon, type CityIconName } from './icons'

type CardProps = {
  title: ReactNode
  href?: string
  external?: boolean
  image?: string | null
  /* describe the moment, not the file — empty when the title already says it */
  imageAlt?: string
  sub?: ReactNode
  desc?: ReactNode
  icon?: CityIconName
  /* shown on the ink ground when there is no photograph */
  fallbackLabel?: string
  ariaLabel?: string
  onClick?: () => void
  className?: string
  headingLevel?: 'h2' | 'h3'
}

/*  The content card. design.md §9.3 — image 16:10 at 14px, a sprig, a Pop
    White title, an Ash sub-line that goes Genda Yellow on hover.             */
export function Card({
  title, href, external, image, imageAlt = '', sub, desc, icon, fallbackLabel, ariaLabel,
  onClick, className = '', headingLevel = 'h3',
}: CardProps) {
  const Title = headingLevel
  const inner = (
    <>
      <div className="hb-card-media">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="hb-card-img" src={image} alt={imageAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="hb-card-fallback">
            {icon && <CityIcon name={icon} />}
            <span className="hb-meta">{fallbackLabel ?? 'Photograph to come'}</span>
          </div>
        )}
        <div className="hb-card-scrim" aria-hidden="true" />
        {image && icon && <CityIcon name={icon} className="hb-card-icon" />}
      </div>
      <div className="hb-card-body">
        <Sprig size={22} />
        <div className="hb-card-text">
          <Title className="hb-card-title">{title}</Title>
          {sub && <p className="hb-card-sub">{sub}</p>}
          {desc && <p className="hb-card-desc">{desc}</p>}
        </div>
      </div>
    </>
  )

  if (href && external) {
    return <a className={`hb-card ${className}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>{inner}</a>
  }
  if (href) {
    return <Link className={`hb-card ${className}`} href={href} aria-label={ariaLabel}>{inner}</Link>
  }
  if (onClick) {
    return <button type="button" className={`hb-card text-left ${className}`} onClick={onClick} aria-label={ariaLabel}>{inner}</button>
  }
  return <article className={`hb-card ${className}`} style={{ cursor: 'default' }}>{inner}</article>
}
