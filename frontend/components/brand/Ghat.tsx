'use client'

import { CloudShader } from '@/components/ui/cloud-shader'

/*
 * The ghat still — drawn, not photographed.
 * Sandhya Arghya: the sun going down over the Ganga, its road of light on the
 * water, the steps of a Patna ghat with diyas along the edges, and sugarcane
 * (ikh) leaning in from both sides. Colour, caption, and band from DESIGN.md
 * §§3, 8, 9.6, 9.7, 10. Fixed seed so SSR matches the client.
 * Sky and clouds: CloudShader.
 */

function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }
}

const HORIZON = 580     /* the shader stops here — see .hb-sky-shader */
const SHORE = 724       /* water ends, the first step begins — above the 21:9 crop line (~793) */
const SUN = { x: 1180, y: 512, r: 58 }

type CaneT = { x: number; h: number; lean: number; o: number; ground: number; front: boolean }

/* the hero stalks, placed by hand so the frame reads at every crop */
const HERO: CaneT[] = [
  { x: 36, h: 560, lean: 54, o: 0.96, ground: 880, front: true },
  { x: 92, h: 620, lean: 70, o: 0.98, ground: 892, front: true },
  { x: 150, h: 500, lean: 40, o: 0.9, ground: 876, front: true },
  { x: 214, h: 440, lean: 58, o: 0.86, ground: 870, front: true },
  { x: 1392, h: 470, lean: -46, o: 0.88, ground: 872, front: true },
  { x: 1452, h: 590, lean: -66, o: 0.97, ground: 890, front: true },
  { x: 1516, h: 530, lean: -50, o: 0.94, ground: 884, front: true },
  { x: 1570, h: 420, lean: -36, o: 0.84, ground: 868, front: true },
]

const FIELD: CaneT[] = (() => {
  const r = seeded(20261113)
  const out: CaneT[] = []
  for (let i = 0; i < 44; i++) {
    const left = r() < 0.5
    const x = left ? 10 + r() * 300 : 1300 + r() * 290
    const front = r() > 0.55
    out.push({
      x,
      h: (front ? 260 : 180) + r() * (front ? 220 : 160),
      lean: (left ? 1 : -1) * (18 + r() * 52),
      o: Math.min(1, (front ? 0.42 : 0.2) + r() * 0.4),
      ground: front ? 860 + r() * 36 : 820 + r() * 40,
      front,
    })
  }
  return out
})()

const CANES = [...FIELD, ...HERO]

/* diyas along the step edges, thicker where people sit */
const DIYAS = (() => {
  const r = seeded(20261115)
  const out: { x: number; y: number; s: number; o: number }[] = []
  const edges = [SHORE + 2, SHORE + 30, SHORE + 58, SHORE + 88, SHORE + 120]
  for (let i = 0; i < 56; i++) {
    const row = Math.floor(r() * edges.length)
    const x = 300 + r() * 1000
    out.push({ x, y: edges[row] - 2, s: 0.7 + r() * 0.6, o: 0.7 + r() * 0.3 })
  }
  return out
})()

/* the shimmer on the water, densest under the sun */
const SHIMMER = (() => {
  const r = seeded(20261116)
  return Array.from({ length: 120 }, () => {
    const y = HORIZON + 8 + r() * (SHORE - HORIZON - 16)
    const t = (y - HORIZON) / (SHORE - HORIZON)          /* 0 near the horizon, 1 near the shore */
    const spread = 40 + t * 420
    const x = SUN.x + (r() - 0.5) * 2 * spread
    return { x, y, w: 6 + r() * (14 + t * 60), o: (0.12 + r() * 0.3) * (1 - t * 0.55) }
  })
})()

/* A sugarcane stalk: a leaning stem with nodes and three or four long blades at the top. */
function Cane({ k }: { k: CaneT }) {
  const tipX = k.x + k.lean
  const tipY = k.ground - k.h
  const blades = []
  const n = k.front ? 4 : 3
  for (let j = 0; j < n; j++) {
    const f = j / (n - 1)
    const by = tipY + f * k.h * 0.22
    const bx = k.x + k.lean * (1 - f * 0.22)
    const dir = j % 2 === 0 ? 1 : -1
    const L = (k.front ? 150 : 100) * (1 - f * 0.35)
    const lift = 40 + f * 30
    blades.push(
      <path
        key={j}
        d={`M${bx} ${by} Q${bx + dir * L * 0.55} ${by - lift * 1.4} ${bx + dir * L} ${by - lift * 0.2}`}
        fill="none"
        stroke={k.front ? '#3E5A2E' : '#2C3E2A'}
        strokeWidth={k.front ? 3.2 : 2}
        strokeLinecap="round"
        opacity={0.9 - f * 0.3}
      />,
    )
  }
  const nodes = []
  const count = Math.floor(k.h / 70)
  for (let j = 1; j < count; j++) {
    const f = j / count
    nodes.push(
      <circle
        key={`n${j}`}
        cx={k.x + k.lean * f}
        cy={k.ground - k.h * f}
        r={k.front ? 3 : 2}
        fill={k.front ? '#5A4A2A' : '#3A3222'}
      />,
    )
  }
  return (
    <g opacity={k.front ? Math.min(1, k.o + 0.06) : k.o * 0.7}>
      <path
        d={`M${k.x} ${k.ground} Q${k.x + k.lean * 0.42} ${k.ground - k.h * 0.52} ${tipX} ${tipY}`}
        fill="none"
        stroke={k.front ? '#6B5432' : '#43381F'}
        strokeLinecap="round"
        strokeWidth={k.front ? 5 : 3}
      />
      {nodes}
      {blades}
    </g>
  )
}

function Diya({ x, y, s, o }: { x: number; y: number; s: number; o: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx="0" cy="0" rx="7" ry="2.4" fill="#5A2E14" />
      <path d="M0 -12 C-3.2 -6 -4.4 -3 -4.4 -1 C-4.4 1.6 -2 3 0 3 C2 3 4.4 1.6 4.4 -1 C4.4 -3 3.2 -6 0 -12Z" fill="#F2B33D" />
      <path d="M0 -8 C-1.4 -5 -2 -3 -2 -1.6 C-2 0 -1 0.8 0 0.8 C1 0.8 2 0 2 -1.6 C2 -3 1.4 -5 0 -8Z" fill="#FCFBF8" opacity="0.85" />
    </g>
  )
}

export function GhatScene() {
  return (
    <>
      <div className="hb-sky-frame">
        <div className="hb-sky-fit">
          <div className="hb-sky-shader">
            <CloudShader
              skyTopColor="#2E2650"
              skyBottomColor="#E5883A"
              cloudColor="#F6D3B0"
              count={5}
              speed={0.5}
            />
          </div>
          <svg className="hb-sky" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <radialGradient id="gh-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD27A" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#F2B33D" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#F2B33D" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="gh-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7A4A2E" />
                <stop offset="38%" stopColor="#3D2E30" />
                <stop offset="100%" stopColor="#132A2E" />
              </linearGradient>
              <linearGradient id="gh-road" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2B33D" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#F2B33D" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gh-stone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3A302A" />
                <stop offset="100%" stopColor="#15110F" />
              </linearGradient>
              <filter id="gh-soft" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
              <filter id="gh-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id="gh-cane" x="-30%" y="-40%" width="160%" height="180%">
                <feGaussianBlur stdDeviation="1.8" />
              </filter>
              <filter id="gh-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="19" result="n" />
                <feColorMatrix in="n" type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="table" tableValues="0 0.08" />
                </feComponentTransfer>
              </filter>
              <radialGradient id="gh-vignette" cx="50%" cy="42%" r="72%">
                <stop offset="55%" stopColor="#132A2E" stopOpacity="0" />
                <stop offset="100%" stopColor="#132A2E" stopOpacity="0.34" />
              </radialGradient>
            </defs>

            {/* the sun — one yellow, one moment. §3.7 */}
            <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 3.4} fill="url(#gh-halo)" />
            <circle className="hb-sky-sun" cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#F2B33D" />
            <circle cx={SUN.x} cy={SUN.y} r={SUN.r - 6} fill="#FFD27A" opacity="0.55" />

            {/* the far bank: Sonepur side, a dark line with a few trees */}
            <path
              d="M0 574 C120 570 200 566 300 572 C380 576 430 562 520 568 C640 574 700 560 820 566 C960 572 1040 560 1160 568 C1280 574 1380 562 1500 570 L1600 572 L1600 586 L0 586 Z"
              fill="#1C1A22"
            />

            {/* the river */}
            <rect x="0" y={HORIZON} width="1600" height={SHORE - HORIZON} fill="url(#gh-water)" />
            <path
              d={`M${SUN.x - 26} ${HORIZON} L${SUN.x + 26} ${HORIZON} L${SUN.x + 250} ${SHORE} L${SUN.x - 250} ${SHORE} Z`}
              fill="url(#gh-road)"
              filter="url(#gh-soft)"
            />
            <g fill="#FCFBF8">
              {SHIMMER.map((s, i) => (
                <rect key={i} x={s.x - s.w / 2} y={s.y} width={s.w} height="1.6" rx="0.8" opacity={s.o} />
              ))}
            </g>

            {/* the steps */}
            <rect x="0" y={SHORE} width="1600" height={900 - SHORE} fill="url(#gh-stone)" />
            {[0, 28, 56, 86, 118, 150].map((dy) => (
              <g key={dy}>
                <rect x="0" y={SHORE + dy} width="1600" height="2" fill="#FCFBF8" opacity={0.16 - dy * 0.0012} />
                <rect x="0" y={SHORE + dy + 2} width="1600" height="1.2" fill="#F2B33D" opacity={0.08} />
              </g>
            ))}
            <g filter="url(#gh-glow)" opacity="0.8">
              {DIYAS.map((d, i) => <Diya key={`g${i}`} {...d} s={d.s * 1.6} o={d.o * 0.45} />)}
            </g>
            {DIYAS.map((d, i) => <Diya key={i} {...d} />)}

            {/* the ikh — back row blurred, front row crisp */}
            <g className="hb-sky-reed-back" filter="url(#gh-cane)">
              {CANES.filter((k) => !k.front).map((k, i) => <Cane key={`b${i}`} k={k} />)}
            </g>
            <g className="hb-sky-reed-front">
              {CANES.filter((k) => k.front).map((k, i) => <Cane key={`f${i}`} k={k} />)}
            </g>

            <rect x="0" y={HORIZON} width="1600" height={900 - HORIZON} filter="url(#gh-grain)" opacity="0.55" />
            <rect width="1600" height="900" fill="url(#gh-vignette)" />
          </svg>
        </div>
      </div>
    </>
  )
}

export default function GhatStill() {
  return (
    <main className="kp-page">
      <style>{`
        .kp-page {
          min-height: 100svh;
          background: #0D1012;
          display: flex;
          align-items: center;
        }
        .kp {
          position: relative;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 2.39 / 1;
          min-height: 420px;
          margin: 0;
        }
        .kp-scrim {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(90deg, rgba(13,16,18,0.78) 0%, rgba(13,16,18,0.32) 36%, rgba(13,16,18,0) 62%),
            linear-gradient(0deg, rgba(13,16,18,0.62) 0%, rgba(38,10,14,0.18) 28%, rgba(38,10,14,0) 48%);
        }
        .kp .hb-capdev {
          position: absolute;
          left: 0; bottom: 0;
          padding: clamp(24px, 5vw, 64px);
          max-width: min(760px, 94%);
        }
        @media (max-width: 720px) {
          .kp { aspect-ratio: 4 / 5; min-height: 100svh; }
        }
      `}</style>
      <h1 className="sr-only">Sandhya Arghya at the ghat</h1>
      <figure className="kp">
        <GhatScene />
        <div className="kp-scrim" aria-hidden="true" />
        <figcaption className="hb-capdev">
          <span className="hb-capdev-tick" aria-hidden="true" />
          <div>
            <p className="hb-capdev-1">The sun goes down over the Ganga,</p>
            <p className="hb-capdev-2">and the whole ghat turns to face it.</p>
          </div>
        </figcaption>
      </figure>
    </main>
  )
}
