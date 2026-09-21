import { NAHAY_KHAY, CHHATH_DAYS } from '@/lib/chhath'

/* ==========================================================================
   Event context for the news feed: what is happening in Bihar today, and
   which phase of it. Ingestion uses it to steer Anakin queries and to tag
   stories; ranking uses it to lift stories about the event that is on now.

   The EVENT persists across days; the STORIES under it rotate (see ranking.ts).
   ========================================================================== */

export type NewsFeed = 'CITY' | 'SPORTS'

export type BiharDay = {
  /* YYYY-MM-DD on the Bihar calendar */
  iso: string
  year: number
  month: number
  day: number
  /* days since 1970-01-01 on the Bihar calendar, for date arithmetic */
  epochDay: number
}

export type ActiveEvent = {
  slug: string
  name: string
  feed: NewsFeed
  phase: string | null
  queries: string[]
  image: string | null
}

type EventDefinition = {
  slug: string
  name: string
  feed: NewsFeed
  /* a story mentioning this belongs to the event */
  match: RegExp
  /* local, known-good artwork used only when the story has no image of its own */
  image?: string
  /* null when the event is not on; otherwise the phase ('' when it has none) */
  phaseOn: (day: BiharDay) => string | null
  phaseFromText?: (text: string) => string | null
  queries: (phase: string) => string[]
}

const DAY_MS = 86_400_000

export function biharDay(now: Date = new Date()): BiharDay {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)
  const [year, month, day] = iso.split('-').map(Number)
  return { iso, year, month, day, epochDay: Math.floor(Date.UTC(year, month - 1, day) / DAY_MS) }
}

function epochDayOf(iso: string) {
  return biharDay(new Date(iso)).epochDay
}

/* a recurring window by month/day; handles windows that wrap the new year */
function withinYearly(day: BiharDay, from: [number, number], to: [number, number]) {
  const value = day.month * 100 + day.day
  const start = from[0] * 100 + from[1]
  const end = to[0] * 100 + to[1]
  return start <= end ? value >= start && value <= end : value >= start || value <= end
}

/* ---------- Chhath Puja --------------------------------------------------- */

/* Build-up coverage (ghat cleaning, the trains home, sugarcane prices) starts
   about three weeks before Nahay Khay; the homecoming traffic and "after
   Chhath" pieces carry on for roughly a week past Usha Arghya. */
const CHHATH_BUILD_UP_DAYS = 21
const CHHATH_AFTER_DAYS = 7

/* CHHATH_DAYS[].en → phase key: 'Nahay Khay' → 'nahay-khay' */
const phaseKey = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

function chhathPhase(day: BiharDay): string | null {
  const nahayKhay = epochDayOf(NAHAY_KHAY)
  const days = CHHATH_DAYS.map((chhathDay) => ({ phase: phaseKey(chhathDay.en), epochDay: epochDayOf(chhathDay.iso) }))
  const ushaArghya = days[days.length - 1].epochDay
  const today = day.epochDay

  if (today < nahayKhay - CHHATH_BUILD_UP_DAYS) return null
  if (today < nahayKhay) return 'build-up'
  const chhathDay = days.find((entry) => entry.epochDay === today)
  if (chhathDay) return chhathDay.phase
  if (today <= ushaArghya + CHHATH_AFTER_DAYS) return 'after'
  return null
}

const CHHATH_PHASE_WORDS: Array<[string, RegExp]> = [
  ['usha-arghya', /\b(usha\s*arghya|morning\s*arghya|paran|parana|sunrise\s*arghya)\b/i],
  ['sandhya-arghya', /\b(sandhya\s*arghya|evening\s*arghya|setting\s*sun|sunset\s*arghya)\b/i],
  ['kharna', /\b(kharna|lohanda|rasiao|kheer)\b/i],
  ['nahay-khay', /\b(nahay\s*khay|nahai\s*khai|kaddu\s*bhat)\b/i],
  ['after', /\b(after chhath|post-?chhath|return journey|ghat clean-?up)\b/i],
]

const CHHATH_QUERIES: Record<string, string[]> = {
  'build-up': ['Chhath Puja 2026 Bihar ghat preparations', 'Chhath special trains Patna', 'Patna ghats Chhath ready'],
  'nahay-khay': ['Nahay Khay Bihar', 'Chhath Puja begins Patna', 'Chhath Nahay Khay Ganga ghat'],
  kharna: ['Kharna Chhath Bihar', 'Chhath Kharna prasad Patna', 'Chhath vratis Bihar'],
  'sandhya-arghya': ['Sandhya Arghya Patna ghats', 'Chhath evening arghya Bihar', 'Chhath crowd Patna Ganga'],
  'usha-arghya': ['Usha Arghya Bihar', 'Chhath concludes Patna', 'Chhath morning arghya Ganga'],
  after: ['after Chhath Bihar', 'Chhath return trains Patna', 'Chhath ghat clean-up Bihar'],
}

/* ---------- Calendar ----------------------------------------------------- */

/* Windows for events without a fixed date are deliberately generous and
   approximate — they only steer searches and tag stories. A story about an
   event that is not on gets no event lift, so a loose window cannot promote
   stale coverage. Confirm the Sonepur Mela and Book Fair dates each season
   (2026: Sonepur 24 Nov – 24 Dec, Patna Pustak Mela 4 – 15 Dec). */
const EVENTS: EventDefinition[] = [
  {
    slug: 'chhath-puja',
    name: 'Chhath Puja',
    feed: 'CITY',
    match: /\b(chhath|chhat\s*puja|nahay\s*khay|kharna|sandhya\s*arghya|usha\s*arghya|chhathi\s*maiya|vrati)\b/i,
    image: '/chhath.jpg',
    phaseOn: chhathPhase,
    phaseFromText: (text) => CHHATH_PHASE_WORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? null,
    queries: (phase) => CHHATH_QUERIES[phase] ?? CHHATH_QUERIES['build-up'],
  },
  {
    slug: 'sonepur-mela',
    name: 'Sonepur Mela',
    feed: 'CITY',
    match: /\b(sonepur|sonpur|harihar\s*kshetra|kartik\s*purnima)\b/i,
    image: '/sonepur.jpg',
    phaseOn: (day) => {
      if (!withinYearly(day, [11, 18], [12, 26])) return null
      if (day.month === 11 && day.day === 24) return 'kartik-purnima'
      return ''
    },
    queries: (phase) => [
      phase === 'kartik-purnima' ? 'Kartik Purnima snan Sonepur' : 'Sonepur Mela today',
      'Sonepur Mela 2026',
      'Harihar Kshetra Mela Bihar',
    ],
  },
  {
    slug: 'patna-book-fair',
    name: 'Patna Pustak Mela',
    feed: 'CITY',
    match: /\b(book\s*fair|pustak\s*mela|patna\s*book)\b/i,
    image: '/gandhi-maidan.jpg',
    phaseOn: (day) => (withinYearly(day, [11, 28], [12, 18]) ? '' : null),
    queries: () => ['Patna Book Fair', 'Patna Pustak Mela Gandhi Maidan', 'Patna Book Fair today'],
  },
  {
    slug: 'rajgir-mahotsav',
    name: 'Rajgir Mahotsav',
    feed: 'CITY',
    match: /\b(rajgir\s*mahotsav)\b/i,
    image: '/rajgir.jpg',
    phaseOn: (day) => (withinYearly(day, [11, 20], [12, 5]) ? '' : null),
    queries: () => ['Rajgir Mahotsav', 'Rajgir Mahotsav 2026 dates'],
  },
  {
    slug: 'makar-sankranti',
    name: 'Makar Sankranti',
    feed: 'CITY',
    match: /\b(makar\s*sankranti|dahi\s*chura|dahi-chura|tilkut|khichdi\s*bhoj)\b/i,
    phaseOn: (day) => (withinYearly(day, [1, 12], [1, 16]) ? '' : null),
    queries: () => ['Makar Sankranti Bihar dahi chura', 'Sankranti Patna tilkut', 'Makar Sankranti Bihar celebrations'],
  },
  {
    slug: 'bihar-diwas',
    name: 'Bihar Diwas',
    feed: 'CITY',
    match: /\b(bihar\s*diwas|bihar\s*day|foundation\s*day\s*of\s*bihar)\b/i,
    phaseOn: (day) => (withinYearly(day, [3, 20], [3, 24]) ? '' : null),
    queries: () => ['Bihar Diwas Gandhi Maidan', 'Bihar Diwas 2027 celebrations', 'Bihar Day Patna'],
  },
  {
    slug: 'holi',
    name: 'Holi',
    feed: 'CITY',
    match: /\b(holi|phaguwa|phagua|holika\s*dahan|jogira)\b/i,
    phaseOn: (day) => (withinYearly(day, [3, 1], [3, 20]) ? '' : null),
    queries: () => ['Holi Bihar celebrations', 'Phaguwa Patna Holi', 'Holi Bihar police arrangements'],
  },
  {
    slug: 'pro-kabaddi',
    name: 'Patna Pirates',
    feed: 'SPORTS',
    match: /\b(patna\s*pirates|pro\s*kabaddi|pkl)\b/i,
    phaseOn: (day) => (withinYearly(day, [8, 20], [12, 31]) ? '' : null),
    queries: () => ['Patna Pirates latest', 'Pro Kabaddi Patna Pirates match', 'Patna Pirates PKL result'],
  },
  {
    slug: 'ranji-trophy',
    name: 'Bihar in the Ranji Trophy',
    feed: 'SPORTS',
    match: /\b(ranji\s*trophy|bihar\s*cricket|moin-?ul-?haq|bca\b)\b/i,
    phaseOn: (day) => (withinYearly(day, [10, 10], [2, 28]) ? '' : null),
    queries: () => ['Bihar Ranji Trophy', 'Bihar cricket team match', 'Moin-ul-Haq Stadium'],
  },
]

export function activeEvents(now: Date = new Date()): ActiveEvent[] {
  const day = biharDay(now)
  return EVENTS.flatMap((event) => {
    const phase = event.phaseOn(day)
    if (phase === null) return []
    return [{
      slug: event.slug,
      name: event.name,
      feed: event.feed,
      phase: phase || null,
      queries: event.queries(phase),
      image: event.image ?? null,
    }]
  })
}

/* Which event, if any, a story belongs to — and which phase of it. The phase
   comes from the story's own words first, then from today's calendar. */
export function detectEvent(text: string, active: ActiveEvent[] = []) {
  for (const event of EVENTS) {
    if (!event.match.test(text)) continue
    const current = active.find((entry) => entry.slug === event.slug)
    return {
      eventSlug: event.slug,
      eventPhase: event.phaseFromText?.(text) ?? current?.phase ?? null,
    }
  }
  return { eventSlug: null, eventPhase: null }
}

export function eventImage(eventSlug: string | null | undefined) {
  return EVENTS.find((event) => event.slug === eventSlug)?.image ?? null
}
