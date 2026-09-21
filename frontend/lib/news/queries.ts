import type { ActiveEvent, NewsFeed } from './events'

/* Search subjects per feed. Each is paired with a recency qualifier below, so
   one subject yields several focused queries rather than one giant prompt. */
const SUBJECTS: Record<NewsFeed, string[]> = {
  CITY: [
    'Bihar news',
    'Patna city news',
    'Bihar events',
    'Bihar culture news',
    'Bihar important news',
    'Patna Metro news',
  ],
  SPORTS: [
    'Bihar sports news',
    'Patna Pirates',
    'Pro Kabaddi Patna',
    'Bihar cricket',
    'Bihar Ranji Trophy',
    'Moin-ul-Haq Stadium',
    'Bihar football',
    'Patna sports',
  ],
}

const QUALIFIERS = ['today', 'latest']

/* Anakin searches are paid and slow; this bounds one feed's ingestion. Event
   queries come first so they survive the cut on a busy day. */
export const MAX_QUERIES_PER_FEED = 10

export function buildNewsQueries(feed: NewsFeed, events: ActiveEvent[] = []) {
  const eventQueries = events.filter((event) => event.feed === feed).flatMap((event) => event.queries)
  /* alternate qualifiers across subjects: "Bihar news today", "Patna city news latest", … */
  const subjectQueries = SUBJECTS[feed].map((subject, index) => `${subject} ${QUALIFIERS[index % QUALIFIERS.length]}`)
  /* the two broadest subjects also get the other qualifier */
  const extra = SUBJECTS[feed].slice(0, 2).map((subject, index) => `${subject} ${QUALIFIERS[(index + 1) % QUALIFIERS.length]}`)
  const seen = new Set<string>()
  return [...eventQueries, ...subjectQueries, ...extra]
    .filter((query) => {
      const key = query.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_QUERIES_PER_FEED)
}
