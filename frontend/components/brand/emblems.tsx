import type { ReactNode } from 'react'
import { petalPath } from './mithila'

/* ================================================================ emblems == */
/*  Filled, two-tone cultural marks in the Madhubani vocabulary: Pearl body with
    a Crimson accent, the way a Mithila artist fills a shape and then dots it.
    64px grid. These are NOT UI icons — see ./icons for those. design.md §7.    */

const P = 'var(--mk-pearl)'
const CR = 'var(--mk-crimson)'
const YL = 'var(--mk-genda)'

type PetalProps = { x: number; y: number; rot: number; L: number; w: number; fill?: string }

export function EP({ x, y, rot, L, w, fill = P }: PetalProps) {
  return (
    <g transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y})`}>
      <path d={petalPath(L, w)} fill={fill} />
    </g>
  )
}

/* the Madhubani peacock's tail: five plumes, each with the eye of the feather */
const MOR_PLUMES = [20, 45, 70, 95, 120].map((rot) => {
  const a = (rot * Math.PI) / 180
  return { rot, ex: Math.round((36 + 18 * Math.sin(a)) * 10) / 10, ey: Math.round((40 - 18 * Math.cos(a)) * 10) / 10 }
})

export const EMBLEMS = {
  surya: (
    <>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
        <EP key={d} x={32} y={32} rot={d} L={30} w={5} />
      ))}
      <circle cx="32" cy="32" r="15" fill={P} />
      <circle cx="32" cy="32" r="8" fill={CR} />
    </>
  ),
  soop: (
    <>
      <circle cx="22" cy="25" r="5" fill={P} /><circle cx="42" cy="25" r="5" fill={P} />
      <circle cx="32" cy="21" r="6" fill={P} />
      <circle cx="32" cy="21" r="2.6" fill={CR} />
      <ellipse cx="32" cy="34" rx="28" ry="6" fill={P} />
      <path d="M4 34 C4 50 18 58 32 58 C46 58 60 50 60 34Z" fill={P} />
      <path d="M32 37 L13 54 M32 37 L32 57 M32 37 L51 54" stroke={CR} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  thekua: (
    <>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => {
        const a = (d * Math.PI) / 180
        return <circle key={d} cx={Math.round((32 + 24 * Math.sin(a)) * 10) / 10} cy={Math.round((32 - 24 * Math.cos(a)) * 10) / 10} r="4" fill={P} />
      })}
      <circle cx="32" cy="32" r="24" fill={P} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
        const a = (d * Math.PI) / 180
        return <circle key={d} cx={Math.round((32 + 13 * Math.sin(a)) * 10) / 10} cy={Math.round((32 - 13 * Math.cos(a)) * 10) / 10} r="2.2" fill={CR} />
      })}
      <circle cx="32" cy="32" r="4" fill={CR} />
    </>
  ),
  daura: (
    <>
      <path d="M14 26 C14 6 50 6 50 26" stroke={P} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="22" r="4.5" fill={P} /><circle cx="32" cy="20" r="5.5" fill={P} /><circle cx="42" cy="22" r="4.5" fill={P} />
      <path d="M10 26 L54 26 L48 58 L16 58Z" fill={P} />
      <path d="M12 37 L52 37 M14 47 L50 47" stroke={CR} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  ikh: (
    <>
      <EP x={32} y={22} rot={-40} L={22} w={5} /><EP x={32} y={22} rot={0} L={24} w={5} />
      <EP x={32} y={22} rot={40} L={22} w={5} />
      <path d="M29 62 L29 22 L35 22 L35 62Z" fill={P} />
      <rect x="28" y="31" width="8" height="2.2" fill={CR} /><rect x="28" y="41" width="8" height="2.2" fill={CR} />
      <rect x="28" y="51" width="8" height="2.2" fill={CR} />
    </>
  ),
  lotus: (
    <>
      <EP x={32} y={46} rot={0} L={40} w={10} /><EP x={32} y={46} rot={-36} L={34} w={9} />
      <EP x={32} y={46} rot={36} L={34} w={9} /><EP x={32} y={46} rot={-70} L={26} w={7.5} />
      <EP x={32} y={46} rot={70} L={26} w={7.5} />
      <path d="M4 48 C14 56 24 58 32 58 C40 58 50 56 60 48 C52 60 40 62 32 62 C24 62 12 60 4 48Z" fill={P} />
      <circle cx="32" cy="45" r="5" fill={CR} />
    </>
  ),
  diya: (
    <>
      <path d="M32 3 C25 16 21 25 21 30 C21 36 26 39 32 39 C38 39 43 36 43 30 C43 25 39 16 32 3Z" fill={YL} />
      <ellipse cx="32" cy="42" rx="26" ry="5" fill={P} />
      <path d="M6 42 C7 53 18 60 32 60 C46 60 57 53 58 42Z" fill={P} />
    </>
  ),
  kalash: (
    <>
      <EP x={19} y={25} rot={-58} L={21} w={5.5} /><EP x={45} y={25} rot={58} L={21} w={5.5} />
      <EP x={25} y={22} rot={-30} L={22} w={5.5} /><EP x={39} y={22} rot={30} L={22} w={5.5} />
      <EP x={32} y={20} rot={0} L={15} w={5} />
      <circle cx="32" cy="11" r="6" fill={P} />
      <path d="M27 11 C29 8 35 8 37 11" stroke={YL} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 25 L54 25 L51 33 L13 33Z" fill={P} />
      <path d="M15 33 C11 49 19 60 32 60 C45 60 53 49 49 33Z" fill={P} />
      <circle cx="32" cy="46" r="6" fill={CR} />
    </>
  ),
  machhli: (
    <>
      <EP x={27} y={22} rot={0} L={11} w={4.5} />
      <ellipse cx="28" cy="33" rx="21" ry="11" fill={P} />
      <path d="M46 33 L61 22 L58 33 L61 44Z" fill={P} />
      <circle cx="15" cy="31" r="2.8" fill={CR} />
      <circle cx="29" cy="33" r="1.8" fill={CR} /><circle cx="35" cy="30" r="1.8" fill={CR} />
      <circle cx="35" cy="36" r="1.8" fill={CR} />
    </>
  ),
  mor: (
    <>
      {MOR_PLUMES.map(({ rot }) => <EP key={rot} x={36} y={40} rot={rot} L={26} w={6} />)}
      {MOR_PLUMES.map(({ rot, ex, ey }) => <circle key={`e${rot}`} cx={ex} cy={ey} r="2.4" fill={CR} />)}
      <ellipse cx="32" cy="44" rx="9" ry="12" fill={P} />
      <path d="M32 36 C32 26 26 22 26 14" stroke={P} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="12" r="4.5" fill={P} />
      <circle cx="22" cy="5" r="1.8" fill={P} /><circle cx="26" cy="3" r="1.8" fill={P} /><circle cx="30" cy="5" r="1.8" fill={P} />
      <path d="M21.5 12 L17 13.5 L21.5 15Z" fill={CR} />
    </>
  ),
  bodhi: (
    <>
      <path d="M32 6 C20 14 10 24 12 36 C14 46 24 50 30 54 L32 62 L34 54 C40 50 50 46 52 36 C54 24 44 14 32 6Z" fill={P} />
      <path d="M32 12 L32 52" stroke={CR} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M32 24 L22 30 M32 24 L42 30 M32 36 L24 42 M32 36 L40 42" stroke={CR} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type EmblemName = keyof typeof EMBLEMS

export const EMBLEM_LIST: [EmblemName, string, string, string][] = [
  ['surya', 'Surya', 'सूरज', 'The most recognisable mark in Bihar: the Chhath sun. Brand moments, splash, empty states.'],
  ['soop', 'Soop', 'सूप', 'The winnowing basket held up at arghya. Offerings, giving, the moment itself.'],
  ['thekua', 'Thekua', 'ठेकुआ', 'The prasad. Rewards, favourites, something sweet at the end.'],
  ['daura', 'Daura', 'दउरा', 'The bamboo basket carried to the ghat on the head. Collections, saved items.'],
  ['ikh', 'Ikh', 'ईख', 'Sugarcane at the ghat. The season turning — dates, countdowns, what is coming.'],
  ['lotus', 'Lotus', 'कमल', 'Purity. The recurring secondary symbol beneath the sun — Nalanda and Madhubani both.'],
  ['diya', 'Diya', 'दीया', 'Hope and a light left on. Saved items, favourites.'],
  ['kalash', 'Kalash', 'कलश', 'Prosperity. Contribution, community funds, giving.'],
  ['machhli', 'Machhli', 'माछ', 'The Mithila fish — fortune and plenty. Community, the marketplace.'],
  ['mor', 'Mor', 'मोर', 'The Madhubani peacock. Premium, featured and awarded states.'],
  ['bodhi', 'Bodhi leaf', 'पीपल', 'Bodh Gaya. Calm, stories, long-form, the archive.'],
]

/* Never smaller than 40px — the fills collapse below that. design.md §7A */
export function Emblem({ name, size = 56, className = '' }: { name: EmblemName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={Math.max(40, size)} height={Math.max(40, size)}
      className={`mk-emblem ${className}`} aria-hidden="true">
      {EMBLEMS[name]}
    </svg>
  )
}
