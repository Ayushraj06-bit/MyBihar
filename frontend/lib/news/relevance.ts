import type { NewsFeed } from './events'

/* ==========================================================================
   Is this story about Bihar, is it sport, and what kind of story is it?
   All scores are 0–1; ranking.ts decides what they are worth.
   ========================================================================== */

/* the state, its cities, districts, landmarks and institutions — names found
   nowhere else */
const LOCAL_TERMS = [
  'bihar', 'patna', 'patliputra', 'pataliputra', 'bodh gaya', 'bodhgaya', 'nalanda', 'rajgir', 'gaya',
  'muzaffarpur', 'darbhanga', 'madhubani', 'bhagalpur', 'munger', 'purnea', 'purnia', 'kishanganj',
  'katihar', 'saharsa', 'begusarai', 'samastipur', 'sitamarhi', 'motihari', 'bettiah', 'chhapra',
  'siwan', 'gopalganj', 'hajipur', 'vaishali', 'sasaram', 'rohtas', 'buxar', 'arrah', 'bhojpur',
  'jehanabad', 'nawada', 'sheikhpura', 'lakhisarai', 'jamui', 'banka', 'araria', 'madhepura', 'supaul',
  'sheohar', 'kaimur', 'golghar', 'gandhi maidan', 'bailey road', 'boring road', 'fraser road',
  'kankarbagh', 'rajendra nagar', 'danapur', 'patna sahib', 'mahatma gandhi setu', 'gandhi setu',
  'jp setu', 'kesaria', 'vikramshila', 'valmiki tiger reserve', 'sonepur', 'sonpur', 'chhath',
  'bihar museum', 'patna museum', 'khuda bakhsh', 'bsrtc', 'bihar police', 'bihar assembly',
  'bihar vidhan', 'patna high court', 'patna municipal', 'patliputra sports complex', 'moin-ul-haq',
  /* Chhath is the state's own festival: its four days and its ghats are Bihar words */
  'nahay khay', 'kharna', 'sandhya arghya', 'usha arghya', 'chhathi maiya', 'thekua', 'litti chokha',
  'collectorate ghat', 'digha ghat', 'kangan ghat', 'kali ghat patna',
]
/* Bihar places whose names also exist elsewhere — Gaya is also a town in
   Nigeria, Mithila a region of Nepal, Ganga every river town, Digha a beach
   in West Bengal, and there is a Gandhi Ghat at Barrackpore too. They count
   only when the story also places itself in Bihar or India. */
const AMBIGUOUS_TERMS = [
  'mithila', 'magadh', 'champaran', 'seemanchal', 'ganga', 'ganges', 'kosi', 'gandak', 'sone',
  'maurya lok', 'zero mile', 'digha', 'anga', 'ara', 'gandhi ghat', 'litti',
]
const termPattern = (terms: string[]) => new RegExp(`\\b(${terms.map((term) => term.replace(/ /g, '\\s+')).join('|')})\\b`, 'gi')
const LOCAL_ONLY = termPattern(LOCAL_TERMS)
const AMBIGUOUS = termPattern(AMBIGUOUS_TERMS)
const INDIA_CONTEXT = /\b(bihar|patna|bihari|india|indian|cricket|kabaddi|pkl|bcci)\b/i
const BIHAR = /\b(bihar|bihari|patna)\b/i

/* "Patna" that is not the city: the Odisha town Patnagarh */
const NOT_THE_STATE = /\bpatnagarh\b/gi

function localMatches(text: string, context: string) {
  const clean = text.replace(NOT_THE_STATE, ' ')
  const matches: string[] = [...(clean.match(LOCAL_ONLY) || [])]
  if (INDIA_CONTEXT.test(context.replace(NOT_THE_STATE, ' '))) matches.push(...(clean.match(AMBIGUOUS) || []))
  return matches.map((match) => match.toLowerCase().replace(/\s+/g, ' '))
}

/* headlines framed around the country rather than the state */
const NATIONAL_FRAMING = /\b(india|india's|indian economy|nationwide|national|centre|union budget|sensex|nifty|rbi|gdp|lok sabha|parliament|pm modi)\b/i

/* Bihar clubs, venues and bodies: a mention is a Bihar sports connection */
const BIHAR_SPORT = /\b(patna\s+pirates|pro\s+kabaddi|pkl|moin-?ul-?haq|patliputra\s+sports\s+complex|bihar\s+cricket\s+association|bca|bihar\s+(cricket|team|ranji|pacer|batter|captain|coach|women|u-?\d+|football|squad|kabaddi)|patna\s+(cricket|football|kabaddi)|santosh\s+trophy|ishan\s+kishan|vaibhav\s+suryavanshi|bihar\s+football\s+association)\b/gi

const SPORT_WORDS = /\b(football|cricket|kabaddi|match|matches|derby|pkl|i-league|goals?|wickets?|ipl|ranji|tournament|coach|striker|midfielder|defender|goalkeeper|batter|batsman|bowler|innings|raider|raid|fixture|league|cup|trophy|stadium|kick-off|scored|hockey|tennis|badminton|chess|marathon|athletics|boxing|t20|odi)\b/gi
/* words that confirm a club name is about the club, not the region */
const SPORT_CONTEXT = /\b(players?|sign(s|ed|ing)?|transfer|club|fans|squad|season|jersey|kit|win|wins|won|beat|draw|loss|defeat|vs|versus|test)\b/i

const CITY_CATEGORIES: Array<[string, RegExp]> = [
  ['transport', /\b(metro|bus|buses|ferry|airport|train|railway|flyover|traffic|e-rickshaw|auto|taxi|bridge|setu|expressway)\b/i],
  ['civic', /\b(pmc|municipal|mayor|minister|government|govt|police|court|high court|assembly|vidhan|election|council|civic|water supply|power cut|hospital)\b/i],
  ['culture', /\b(festival|puja|chhath|ghat|book fair|pustak mela|film|theatre|music|concert|exhibition|art|madhubani|heritage|museum|literary|poet|author|dance|mela|holi|sankranti|bihar diwas)\b/i],
  ['weather', /\b(rain|monsoon|storm|heatwave|temperature|weather|waterlogging|flood|kosi|ganga level)\b/i],
]
const SPORTS_CATEGORIES: Array<[string, RegExp]> = [
  ['kabaddi', /\b(kabaddi|pkl|patna pirates|raider|raid)\b/i],
  ['cricket', /\b(cricket|ipl|ranji|moin-?ul-?haq|wickets?|batter|bowler|innings|t20|odi|bcci|bca)\b/i],
  ['football', /\b(football|i-league|santosh trophy|striker|midfielder)\b/i],
]

const IMPORTANCE = /\b(announce[sd]?|launch(es|ed)?|opens?|opened|inaugurat\w*|first|record|final|wins?|won|champions?|title|derby|major|biggest|historic|approve[sd]?|unveil\w*|begins?|breaking|signs?|appoint\w*|new)\b/gi

/* service pages, listings and retrospectives that are not today's stories */
const LOW_VALUE = /\b(horoscope|rashifal|lottery|gold (rate|price)|silver (rate|price)|petrol (rate|price)|diesel (rate|price)|obituary|quiz|crossword|wordle|live score|scorecard|photo gallery|web stor(y|ies)|weather for|forecast for|hourly forecast|final score|team news|transfer rumours|full squad|players list|who won (the )?toss|this day,? that year|on this day|throwback|news, photos|latest news headlines)\b/i
/* tag pages, team pages, match centres, weather */
const NON_ARTICLE_PATH = /\/(tags?|newstag|topics?|team|teams|players?|match|matches|scores?|live-?score|weather|forecast|category|author|search)\//i

/* A headline about a past year ("ISL 2024", "(16 Dec, 2018)") is not today's
   news — unless it names a season running into this year ("2025-26"). */
export function isAboutPastYear(title: string, now: Date = new Date()) {
  const current = now.getUTCFullYear()
  if (new RegExp(`\\b${current - 1}\\s*[-–/]\\s*(${current}|${String(current).slice(2)})\\b`).test(title)) return false
  const years = (title.match(/\b20\d{2}\b/g) || []).map(Number)
  return years.length > 0 && years.every((year) => year < current)
}

function distinct(text: string, pattern: RegExp) {
  return new Set((text.match(pattern) || []).map((match) => match.toLowerCase().replace(/\s+/g, ' '))).size
}

/* 0–1: how much this story is about Bihar.
   A headline mention is the strongest signal (0.55); each body mention adds
   0.1, up to four; a Bihar/Patna mention adds a little. A nationally framed
   headline without the state in it loses 0.25 — "India's economy grows", with
   Bihar named once in passing, lands near zero.
   `where` is extra location context (the article URL's path, which often
   reads /city/patna/ or /bihar/) that settles ambiguous place names. */
export function biharRelevance(title: string, body = '', where = '') {
  const context = `${title} ${body} ${where}`
  const inTitle = new Set(localMatches(title, context)).size
  const inBody = localMatches(body, context).length
  let score = (inTitle ? 0.55 : 0) + Math.min(inBody, 4) * 0.1 + (BIHAR.test(context) ? 0.05 : 0)
  if (!inTitle && NATIONAL_FRAMING.test(title)) score -= 0.25
  return clamp(score)
}

/* Bihar club/venue mentions — "Pro Kabaddi", "PKL" and "BCA" only when the
   story is set in India, since a league acronym alone is not a Patna connection */
function biharSportMatches(text: string, context: string) {
  const matches = (text.match(BIHAR_SPORT) || []).map((match) => match.toLowerCase().replace(/\s+/g, ' '))
  return INDIA_CONTEXT.test(context) ? matches : matches.filter((match) => !/^(pro kabaddi|pkl|bca)$/.test(match))
}

export function isSportsStory(title: string, body = '', where = '') {
  const text = `${title} ${body}`
  const clubs = new Set(biharSportMatches(text, `${text} ${where}`)).size
  const sportWords = distinct(text, SPORT_WORDS)
  return (clubs > 0 && (sportWords > 0 || SPORT_CONTEXT.test(text))) || sportWords >= 2
}

/* 0–1: how strong the story's Bihar sports connection is.
   A Bihar club, venue or Bihar side is the connection (0.6, +0.1 for each
   further one); a Bihar place name in a sports story is a weaker one (0.3);
   either appearing in the headline adds 0.15. */
export function sportsRelevance(title: string, body = '', where = '') {
  const text = `${title} ${body}`
  const context = `${text} ${where}`
  const clubs = new Set(biharSportMatches(text, context)).size
  const local = localMatches(text, context).length > 0
  let score = clubs ? 0.6 + Math.min(clubs - 1, 3) * 0.1 : 0
  if (local) score += 0.3
  if (biharSportMatches(title, context).length || localMatches(title, context).length) score += 0.15
  return clamp(score)
}

/* 0–1: does the headline describe something happening, rather than a feature?
   Three or more "event" words saturate it. */
export function importance(title: string) {
  return clamp(distinct(title, IMPORTANCE) / 3)
}

export function isLowValue(title: string, url = '') {
  let path = ''
  try {
    path = new URL(url).pathname
  } catch {
    /* no URL to judge */
  }
  return LOW_VALUE.test(title) || NON_ARTICLE_PATH.test(path) || /\/(live-score|scorecard|horoscope|photos?|gallery|web-?stories)\//i.test(path)
}

/* News URLs carry an id or a long slug; section fronts ("/city/patna") do not. */
export function looksLikeArticle(url: string) {
  try {
    const { pathname } = new URL(url)
    return /\d{5,}/.test(pathname)
      || pathname.split('/').some((segment) => (segment.match(/-/g) || []).length >= 3)
      || /\.(html?|cms|php)$/i.test(pathname)
  } catch {
    return false
  }
}

export function categorize(type: NewsFeed, title: string, body = '') {
  const text = `${title} ${body}`
  const table = type === 'SPORTS' ? SPORTS_CATEGORIES : CITY_CATEGORIES
  return table.find(([, pattern]) => pattern.test(text))?.[0] ?? (type === 'SPORTS' ? 'other' : 'general')
}

/* The minimum relevance for a story to be kept at all. 0.4 means a CITY story
   needs the state or a Bihar town in its headline (or four body mentions), and
   a SPORTS story needs a Bihar club/venue, or a Bihar place in its headline. */
export const MIN_BIHAR_RELEVANCE = 0.4
export const MIN_SPORTS_RELEVANCE = 0.4

export type Assessment =
  | { accepted: true; type: NewsFeed; category: string; relevance: number; importance: number }
  | { accepted: false; reason: string }

/* Classify by content, not by which search found it: a Pirates match report
   surfacing in a city search is SPORTS; a Metro story from a sports search is CITY. */
export function assessStory(
  { title, description = '', url = '' }: { title: string; description?: string | null; url?: string },
  now: Date = new Date(),
): Assessment {
  const body = description || ''
  if (!title?.trim()) return { accepted: false, reason: 'no title' }
  if (isLowValue(title, url)) return { accepted: false, reason: 'low-value page' }
  if (isAboutPastYear(title, now)) return { accepted: false, reason: 'about a past year' }
  if (url && !looksLikeArticle(url)) return { accepted: false, reason: 'not an article' }

  let where = ''
  try {
    where = decodeURIComponent(new URL(url).pathname).replace(/[/_-]+/g, ' ')
  } catch {
    /* no URL context */
  }

  if (isSportsStory(title, body, where)) {
    const relevance = sportsRelevance(title, body, where)
    if (relevance < MIN_SPORTS_RELEVANCE) return { accepted: false, reason: `weak Bihar sports link (${relevance.toFixed(2)})` }
    return { accepted: true, type: 'SPORTS', category: categorize('SPORTS', title, body), relevance, importance: importance(title) }
  }

  const relevance = biharRelevance(title, body, where)
  if (relevance < MIN_BIHAR_RELEVANCE) return { accepted: false, reason: `not about Bihar (${relevance.toFixed(2)})` }
  return { accepted: true, type: 'CITY', category: categorize('CITY', title, body), relevance, importance: importance(title) }
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}
