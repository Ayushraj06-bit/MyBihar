import type { ReactNode } from 'react'

/* ================================================================== icons == */
/*  UI utility. Line, 32px grid, 1.5px, no fills — the deliberate opposite of
    the emblems, so the two can never be confused. design.md §7B.

    Crimson Silk for active states, Soft Pearl on dark. Never two colours in one
    icon, never a filled variant, and an icon never carries meaning alone — it
    always sits beside a word, or carries an aria-label on an icon-only control. */

export const ICONS = {
  setu: (
    <>
      <path d="M1 11h30" /><path d="M4 8h24" /><path d="M4 8v3M28 8v3" />
      <path d="M7 11v13M16 11v13M25 11v13" /><path d="M4 15h6M13 15h6M22 15h6" />
      <path d="M1 28q3-2 6 0t6 0 6 0 6 0 6 0" />
    </>
  ),
  metro: (
    <>
      <rect x="7" y="4" width="18" height="20" rx="4" /><path d="M7 16h18" />
      <rect x="10" y="8" width="12" height="5" rx="1" />
      <circle cx="12" cy="20" r="1.5" /><circle cx="20" cy="20" r="1.5" />
      <path d="M10 24l-3 4M22 24l3 4" />
    </>
  ),
  auto: (
    <>
      <path d="M5 21v-6q0-3 3-3h4l3-5h9q2 0 2 2v12Z" /><path d="M12 12h14" />
      <path d="M12 7h10" /><circle cx="8" cy="23" r="2.5" /><circle cx="22" cy="23" r="2.5" />
      <path d="M10.5 23h9" />
    </>
  ),
  rickshaw: (
    <>
      <circle cx="11" cy="22" r="6" /><circle cx="11" cy="22" r="1.5" />
      <path d="M7 16h11l2-7H10Z" /><path d="M10 9q1-5 6-5t5 5" />
      <path d="M20 11 30 6M18 16l10-4" />
    </>
  ),
  golghar: (
    <>
      <path d="M4 26C4 12 12 5 16 5c4 0 12 7 12 21Z" /><path d="M2 26h28" /><path d="M16 5V2" />
      <path d="M8 10q8-3 16 0" /><path d="M5 15q11-4 22 0" /><path d="M6 20q10-4 20 0" />
    </>
  ),
  haveli: (
    <>
      <path d="M5 28V10h22v18" /><path d="M3 10l13-7 13 7" />
      <rect x="13" y="18" width="6" height="10" /><path d="M8 14h4v4H8zM20 14h4v4h-4z" />
      <path d="M2 28h28" />
    </>
  ),
  boat: (
    <>
      <path d="M3 19h26l-3.5 6H6.5Z" /><path d="M16 19V4" /><path d="M16 6l8 5-8 3.5" />
      <path d="M2 29q3-2.5 6 0t6 0 6 0 6 0" />
    </>
  ),
  kulhad: (
    <>
      <path d="M10.5 13 12.5 25q.3 1.5 3.5 1.5t3.5-1.5L21.5 13Z" /><path d="M9 13h14" />
      <path d="M13.5 9q1.5-2 0-4M18.5 9q1.5-2 0-4" />
    </>
  ),
  litti: (
    <>
      <circle cx="12" cy="15" r="5" /><circle cx="21" cy="14" r="5" />
      <path d="M4 22h24l-2 4H6Z" /><path d="M10 13q2-1 4 0M19 12q2-1 4 0" />
    </>
  ),
  book: (
    <>
      <path d="M16 8q-4-3-11-2v18q7-1 11 2Z" /><path d="M16 8q4-3 11-2v18q-7-1-11 2Z" />
      <path d="M16 8v18" />
    </>
  ),
  signboard: (
    <>
      <rect x="4" y="5" width="24" height="14" rx="1.5" /><path d="M16 19v6" /><path d="M10 28h12" />
      <path d="M8 10h16M8 14.5h9" />
    </>
  ),
  lamp: (
    <>
      <path d="M16 29V13" /><path d="M11.5 29h9" />
      <path d="M12 13l2-6h4l2 6Z" /><path d="M16 7V4" /><circle cx="16" cy="2.5" r="1.2" />
      <path d="M12.5 15q-4 0-4 3M19.5 15q4 0 4 3" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type CityIconName = keyof typeof ICONS

export const ICON_LIST: [CityIconName, string, string][] = [
  ['setu', 'Mahatma Gandhi Setu', 'The state itself — map and location states'],
  ['metro', 'Patna Metro', 'Transport, routes, getting there'],
  ['auto', 'Shared auto', 'Rides, directions, distance'],
  ['rickshaw', 'Cycle rickshaw', 'Patna City, heritage walks'],
  ['golghar', 'Golghar', 'Landmarks, monuments, guided routes'],
  ['haveli', 'Patna City haveli', 'Neighbourhoods, mohallas, old houses'],
  ['boat', 'Ganga boat', 'The river, the ghats, crossings'],
  ['kulhad', 'Chai in a kulhad', 'Food and drink, adda, places to sit'],
  ['litti', 'Litti chokha', 'Street food, markets, Maurya Lok'],
  ['book', 'Khuda Bakhsh Library', 'Stories, long-form, the archive'],
  ['signboard', 'Hand-painted signage', 'Listings, names, mohalla clubs'],
  ['lamp', 'Street lamp', 'Night mode, after-dark listings'],
]

type IconProps = { name: CityIconName; size?: number; className?: string }

export function CityIcon({ name, size = 32, className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`mk-icon ${className}`}
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

/* --------------------------------------------------------------- controls -- */
/*  The small controls the city set has no drawing for — search, close, the
    view switcher. Same line language as the navigation's search glyph: 24px
    grid, 1.75 stroke, round joins, no fills.                                  */

const UI = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12l5 5L20 7" />,
  back: <path d="M15 5l-7 7 7 7" />,
  locate: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.6" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  filter: <path d="M4 7h16M7 12h10M10 17h4" />,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  list: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
} satisfies Record<string, ReactNode>

export type UiIconName = keyof typeof UI

export function UiIcon({ name, size = 18, className = '' }: { name: UiIconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`mk-ui-icon ${className}`}
      fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {UI[name]}
    </svg>
  )
}
