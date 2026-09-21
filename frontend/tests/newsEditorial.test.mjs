// Tests for the Home "In the news" editorial system: relevance, ranking,
// rotation, events, deduplication, ingestion and the failsafes.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeEvents, detectEvent, biharDay } from '../lib/news/events.ts'
import { buildNewsQueries } from '../lib/news/queries.ts'
import { assessStory, biharRelevance } from '../lib/news/relevance.ts'
import { canonicalUrl, sourceTier } from '../lib/news/sources.ts'
import {
  COOLDOWN_HOURS, rankStory, selectHomeStory, STALE_PENALTY,
} from '../lib/news/ranking.ts'
import { resolveStoryImage, TRUSTED_FALLBACK_IMAGE } from '../lib/news/images.ts'
import { ingestBiharNews, ingestionDue } from '../lib/news/ingest.ts'
import { FALLBACK_HOME_NEWS, getHomeNews, selectHomeNews } from '../lib/news/home.ts'

const HOUR = 3_600_000
const NOW = new Date('2026-09-19T06:00:00+05:30')
const hoursAgo = (hours, from = NOW) => new Date(from.getTime() - hours * HOUR)
const silent = () => {}

let seq = 0
function story(overrides = {}) {
  seq++
  return {
    id: `s${seq}`,
    type: 'CITY',
    title: `Bihar story ${seq}`,
    description: null,
    image: `https://example.com/${seq}.jpg`,
    link: `https://www.prabhatkhabar.com/state/bihar/patna/story-number-${seq}-pk${seq}000`,
    sourceName: 'Prabhat Khabar',
    sourceDomain: 'prabhatkhabar.com',
    score: 50,
    publishedAt: hoursAgo(2),
    discoveredAt: hoursAgo(2),
    isActive: true,
    featuredAt: null,
    cooldownUntil: null,
    expiresAt: null,
    eventSlug: null,
    eventPhase: null,
    ...overrides,
  }
}

/* ---------- an in-memory NewsRepository ---------------------------------- */

function memoryRepository(initial = []) {
  const rows = initial.map((row) => ({ createdAt: new Date(0), updatedAt: new Date(0), ...row }))
  let id = 0
  const copy = (row) => (row ? { ...row } : null)
  return {
    rows,
    async findDuplicate({ canonicalUrl, titleKey, contentHash }) {
      for (const [key, value] of [['canonicalUrl', canonicalUrl], ['titleKey', titleKey], ['contentHash', contentHash]]) {
        const row = value && rows.find((entry) => entry[key] === value)
        if (row) return copy(row)
      }
      return null
    },
    async create(data) {
      for (const key of ['canonicalUrl', 'titleKey', 'contentHash']) {
        if (data[key] && rows.some((row) => row[key] === data[key])) throw Object.assign(new Error('unique'), { code: 'P2002' })
      }
      const row = { id: `m${++id}`, score: 0, isActive: true, createdAt: new Date(), updatedAt: new Date(), ...data }
      rows.push(row)
      return copy(row)
    },
    async update(rowId, data) {
      const row = rows.find((entry) => entry.id === rowId)
      Object.assign(row, data)
      return copy(row)
    },
    async deactivateExpired(now) {
      let count = 0
      for (const row of rows) {
        if (['CITY', 'SPORTS'].includes(row.type) && row.isActive && row.expiresAt && row.expiresAt <= now) {
          row.isActive = false
          count++
        }
      }
      return count
    },
    async listRecent(types, since) {
      return rows.filter((row) => types.includes(row.type) && row.isActive
        && ((row.publishedAt ?? row.discoveredAt) >= since)).map(copy)
    },
    async latestOfType(type, { activeOnly = false } = {}) {
      const matches = rows.filter((row) => row.type === type && (!activeOnly || row.isActive))
      return copy(matches.sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))[0])
    },
    async lastIngestedAt() {
      return rows.map((row) => row.lastSeenAt).filter(Boolean).sort((a, b) => b - a)[0] ?? null
    },
  }
}

const RESULTS = {
  metro: {
    url: 'https://www.prabhatkhabar.com/state/bihar/patna/patna-metro-announces-new-service-on-blue-line-pk2101234?utm_source=x',
    title: 'Patna Metro announces new service on Blue Line | Prabhat Khabar',
    snippet: 'Patna Metro Rail Corporation will run extra trains from Monday, officials said.',
    date: '2 hours ago',
  },
  derby: {
    url: 'https://timesofindia.indiatimes.com/sports/kabaddi/patna-pirates-sign-new-raider-ahead-of-pkl-opener/articleshow/123456789.cms',
    title: 'Patna Pirates sign new raider ahead of PKL opener',
    snippet: 'The Patna club confirmed the signing on Friday.',
    date: '5 hours ago',
  },
  economy: {
    url: 'https://www.livemint.com/economy/india-economy-grows-seven-percent-in-q1-11726712345678.html',
    title: "India's economy grows 7% in first quarter",
    snippet: 'Growth was broad-based across Mumbai, Delhi, Bihar and Chennai.',
    date: '3 hours ago',
  },
}

function fakeAnakin(resultsByQuery = () => [RESULTS.metro, RESULTS.derby, RESULTS.economy]) {
  const calls = []
  return {
    calls,
    hasApiKey: true,
    async search(prompt) {
      calls.push(prompt)
      return resultsByQuery(prompt)
    },
  }
}

const ogPage = (image) => `<html><head><meta property="og:image" content="${image}"></head></html>`

/* ---------- 1, 11, 12: CITY and SPORTS stay separate --------------------- */

test('stories are classified by content into CITY or SPORTS', () => {
  const metro = assessStory({ title: 'Patna Metro announces new service', url: RESULTS.metro.url })
  assert.equal(metro.accepted && metro.type, 'CITY')
  const signing = assessStory({ title: 'Patna Pirates sign new player', url: RESULTS.derby.url })
  assert.equal(signing.accepted && signing.type, 'SPORTS')
  const test_ = assessStory({ title: 'Bihar vs Jharkhand Ranji Trophy match at Moin-ul-Haq Stadium', url: 'https://example.com/cricket/bihar-vs-jharkhand-ranji-trophy-match-at-moin-ul-haq-stadium' })
  assert.equal(test_.accepted && test_.type, 'SPORTS')
  const puja = assessStory({ title: 'Patna ghat committee announces Chhath arrangements', url: 'https://example.com/patna-ghat-committee-announces-chhath-arrangements' })
  assert.equal(puja.accepted && puja.type, 'CITY')
})

test('a generic India story that mentions Bihar once is rejected', () => {
  const verdict = assessStory({ title: RESULTS.economy.title, description: RESULTS.economy.snippet, url: RESULTS.economy.url })
  assert.equal(verdict.accepted, false)
  assert.ok(biharRelevance(RESULTS.economy.title, RESULTS.economy.snippet) < 0.2)
  const cricket = assessStory({ title: 'India beat Australia in Perth Test', url: 'https://example.com/cricket/india-beat-australia-in-perth-test' })
  assert.equal(cricket.accepted, false, 'sport without a Bihar connection is not Bihar sport')
})

test('the sports card never selects a CITY article, and the city card never a SPORTS one', () => {
  const city = story({ type: 'CITY', score: 90 })
  const sports = story({ type: 'SPORTS', score: 10, publishedAt: hoursAgo(60) })
  assert.equal(selectHomeStory([city, sports], 'SPORTS', { now: NOW }).id, sports.id)
  assert.equal(selectHomeStory([city, sports], 'CITY', { now: NOW }).id, city.id)
  assert.equal(selectHomeStory([city], 'SPORTS', { now: NOW }), null)
  assert.equal(selectHomeStory([sports], 'CITY', { now: NOW }), null)
})

test('Home falls back per card without borrowing across types', async () => {
  const onlyCity = memoryRepository([story({ type: 'CITY', title: 'Patna Metro news' })])
  const news = await selectHomeNews(onlyCity, NOW)
  assert.equal(news.city.title, 'Patna Metro news')
  assert.equal(news.sports.type, 'SPORTS')
  assert.equal(news.sports.id, FALLBACK_HOME_NEWS.sports.id)
  assert.equal(news.newspaper.title, 'Prabhat Khabar today')
})

/* ---------- 2: deduplication --------------------------------------------- */

test('canonical URLs collapse tracking params, AMP and trailing slashes', () => {
  const base = 'https://prabhatkhabar.com/state/bihar/patna/story-pk2101234'
  assert.equal(canonicalUrl(`${base}?utm_source=x&utm_medium=y`), base)
  assert.equal(canonicalUrl('https://www.prabhatkhabar.com/state/bihar/patna/story-pk2101234/amp'), base)
  assert.equal(canonicalUrl(`${base}/#comments`), base)
})

test('the same article found by several searches is stored once', async () => {
  const repository = memoryRepository()
  const variants = [
    RESULTS.metro,
    { ...RESULTS.metro, url: RESULTS.metro.url.replace('?utm_source=x', '?utm_campaign=y') },
    { ...RESULTS.metro, url: RESULTS.metro.url.replace('www.', '') },
  ]
  await ingestBiharNews({ repository, anakin: fakeAnakin(() => variants), fetchHtml: async () => null, now: NOW, log: silent })
  assert.equal(repository.rows.filter((row) => row.title.includes('Blue Line')).length, 1)
})

/* ---------- 3, 4: freshness ---------------------------------------------- */

test('fresh stories rank higher than older ones', () => {
  const fresh = story({ publishedAt: hoursAgo(1) })
  const yesterday = story({ publishedAt: hoursAgo(26) })
  assert.ok(rankStory(fresh, { now: NOW }).total > rankStory(yesterday, { now: NOW }).total)
  assert.equal(selectHomeStory([yesterday, fresh], 'CITY', { now: NOW }).id, fresh.id)
})

test('stale stories lose priority and old ones drop out', () => {
  const stale = rankStory(story({ publishedAt: hoursAgo(80) }), { now: NOW })
  assert.equal(stale.parts.stale, -STALE_PENALTY)
  const better = story({ score: 80, publishedAt: hoursAgo(100) })
  const modest = story({ score: 40, publishedAt: hoursAgo(3) })
  assert.equal(selectHomeStory([better, modest], 'CITY', { now: NOW }).id, modest.id)
  const ancient = story({ publishedAt: hoursAgo(24 * 9) })
  assert.equal(selectHomeStory([ancient], 'CITY', { now: NOW }), null)
})

/* ---------- 5: cooldown and rotation ------------------------------------- */

test('a featured story gets a cooldown and gives way the next day', async () => {
  const first = story({ title: 'Patna heritage walk through Patna City returns', score: 60, publishedAt: hoursAgo(1) })
  const second = story({ title: 'Kankarbagh gets a new public library', score: 50, publishedAt: hoursAgo(3) })
  const repository = memoryRepository([first, second])

  await ingestBiharNews({ repository, anakin: null, now: NOW, log: silent })
  const featured = repository.rows.find((row) => row.id === first.id)
  assert.deepEqual(featured.featuredAt, NOW)
  assert.deepEqual(featured.cooldownUntil, new Date(NOW.getTime() + COOLDOWN_HOURS * HOUR))

  const tomorrow = new Date(NOW.getTime() + 25 * HOUR)
  await ingestBiharNews({ repository, anakin: null, now: tomorrow, log: silent })
  const news = await selectHomeNews(repository, tomorrow)
  assert.equal(news.city.id, second.id, 'another fresh story replaces yesterday’s')
})

test('a lone major story may stay on after its turn', () => {
  const only = story({ featuredAt: hoursAgo(30), cooldownUntil: new Date(NOW.getTime() + 40 * HOUR) })
  assert.equal(selectHomeStory([only], 'CITY', { now: NOW }).id, only.id)
})

test('during its turn a featured story is only displaced by far bigger news', () => {
  const holder = story({ score: 40, featuredAt: hoursAgo(3), cooldownUntil: new Date(NOW.getTime() + 60 * HOUR) })
  const slightlyBetter = story({ score: 50, publishedAt: hoursAgo(1) })
  assert.equal(selectHomeStory([holder, slightlyBetter], 'CITY', { now: NOW }).id, holder.id)
  const breaking = story({ score: 95, publishedAt: hoursAgo(0.2) })
  assert.equal(selectHomeStory([holder, breaking], 'CITY', { now: NOW }).id, breaking.id)
})

/* ---------- 6, 7: events --------------------------------------------------- */

const SANDHYA_ARGHYA = new Date('2026-11-15T09:00:00+05:30')

test('the Chhath Puja phase follows the calendar and steers the searches', () => {
  const chhath = activeEvents(SANDHYA_ARGHYA).find((event) => event.slug === 'chhath-puja')
  assert.equal(chhath.phase, 'sandhya-arghya')
  assert.ok(buildNewsQueries('CITY', activeEvents(SANDHYA_ARGHYA)).includes('Sandhya Arghya Patna ghats'))
  assert.equal(activeEvents(new Date('2026-11-13T09:00:00+05:30')).find((event) => event.slug === 'chhath-puja').phase, 'nahay-khay')
  assert.equal(activeEvents(new Date('2026-11-16T09:00:00+05:30')).find((event) => event.slug === 'chhath-puja').phase, 'usha-arghya')
  assert.equal(activeEvents(new Date('2026-11-01T09:00:00+05:30')).find((event) => event.slug === 'chhath-puja').phase, 'build-up')
  assert.equal(activeEvents(NOW).some((event) => event.slug === 'chhath-puja'), false, 'not on three weeks before Nahay Khay')
  assert.ok(buildNewsQueries('SPORTS', activeEvents(SANDHYA_ARGHYA)).every((query) => !/arghya/i.test(query)), 'city events stay out of sports searches')
  assert.equal(biharDay(new Date('2026-11-14T20:00:00Z')).iso, '2026-11-15', 'dates are Bihar dates')
})

test('stories are tagged with their event and phase', () => {
  assert.deepEqual(detectEvent('Sandhya Arghya draws lakhs to Gandhi Ghat', activeEvents(SANDHYA_ARGHYA)), { eventSlug: 'chhath-puja', eventPhase: 'sandhya-arghya' })
  assert.deepEqual(detectEvent('Crowds throng the Pustak Mela on its opening day'), { eventSlug: 'patna-book-fair', eventPhase: null })
  assert.deepEqual(detectEvent('PMC begins pothole repairs'), { eventSlug: null, eventPhase: null })
})

test('multi-day event stories stay relevant while the event is on', () => {
  const events = activeEvents(SANDHYA_ARGHYA)
  const chhathStory = story({ eventSlug: 'chhath-puja', eventPhase: 'kharna', publishedAt: hoursAgo(40, SANDHYA_ARGHYA) })
  const ordinary = story({ publishedAt: hoursAgo(40, SANDHYA_ARGHYA) })
  assert.ok(rankStory(chhathStory, { now: SANDHYA_ARGHYA, events }).total > rankStory(ordinary, { now: SANDHYA_ARGHYA, events }).total)
  assert.equal(selectHomeStory([ordinary, chhathStory], 'CITY', { now: SANDHYA_ARGHYA, events }).id, chhathStory.id)
  const phaseStory = story({ eventSlug: 'chhath-puja', eventPhase: 'sandhya-arghya', publishedAt: hoursAgo(40, SANDHYA_ARGHYA) })
  assert.ok(rankStory(phaseStory, { now: SANDHYA_ARGHYA, events }).total > rankStory(chhathStory, { now: SANDHYA_ARGHYA, events }).total, 'today’s phase gets a little more')
})

test('event stories rotate from day to day while the event persists', async () => {
  const kharna = new Date('2026-11-14T07:00:00+05:30')
  const opening = story({ title: 'Patna ghats fill up for Kharna evening', eventSlug: 'chhath-puja', eventPhase: 'kharna', score: 60, publishedAt: hoursAgo(2, kharna) })
  const repository = memoryRepository([opening])
  await ingestBiharNews({ repository, anakin: null, now: kharna, log: silent })
  assert.equal((await selectHomeNews(repository, kharna)).city.id, opening.id)

  const arghyaStory = story({ title: 'Sandhya Arghya at Gandhi Ghat draws record crowd', eventSlug: 'chhath-puja', eventPhase: 'sandhya-arghya', score: 55, publishedAt: hoursAgo(2, SANDHYA_ARGHYA) })
  repository.rows.push({ createdAt: new Date(), updatedAt: new Date(), ...arghyaStory })
  const nextDay = new Date(kharna.getTime() + 25 * HOUR)
  await ingestBiharNews({ repository, anakin: null, now: nextDay, log: silent })
  const news = await selectHomeNews(repository, nextDay)
  assert.equal(news.city.id, arghyaStory.id)
})

/* ---------- 8: Anakin failure -------------------------------------------- */

test('an Anakin outage leaves persisted stories on Home', async () => {
  const kept = story({ title: 'Mahatma Gandhi Setu gets new lighting', publishedAt: hoursAgo(20) })
  const repository = memoryRepository([kept])
  const broken = { hasApiKey: true, async search() { throw new Error('Anakin request failed (503)') } }
  const summary = await ingestBiharNews({ repository, anakin: broken, now: NOW, log: silent })
  assert.ok(summary.searchFailures > 0)
  assert.equal(summary.created, 0)
  assert.equal(summary.selected.CITY.id, kept.id)
  const news = await getHomeNews(repository, { now: NOW, useCache: false })
  assert.equal(news.city.title, 'Mahatma Gandhi Setu gets new lighting')
})

test('a database outage serves the seeded fallback instead of failing', async () => {
  const down = new Proxy({}, { get: () => async () => { throw new Error('connection refused') } })
  const news = await getHomeNews(down, { now: NOW, useCache: false })
  assert.deepEqual(news, FALLBACK_HOME_NEWS)
  for (const card of [news.newspaper, news.city, news.sports]) assert.ok(card.title && card.image)
})

/* ---------- 9: images ------------------------------------------------------ */

test('images come from the article first, then fall back without breaking', async () => {
  const fromArticle = await resolveStoryImage(
    { title: 'x', link: RESULTS.metro.url, type: 'CITY' },
    { fetchHtml: async () => ogPage('https://img.prabhatkhabar.com/metro.jpg') },
  )
  assert.deepEqual(fromArticle, { image: 'https://img.prabhatkhabar.com/metro.jpg', imageSource: 'article-og', imageSourceUrl: RESULTS.metro.url })

  const logoOnly = await resolveStoryImage(
    { title: 'x', link: RESULTS.metro.url, type: 'SPORTS' },
    { fetchHtml: async () => ogPage('https://www.prabhatkhabar.com/static/logo.png') },
  )
  assert.equal(logoOnly.image, TRUSTED_FALLBACK_IMAGE.SPORTS, 'a site logo is not a story photo')

  const event = await resolveStoryImage({ title: 'x', link: RESULTS.metro.url, type: 'CITY', eventSlug: 'patna-book-fair' }, { fetchHtml: async () => null })
  assert.equal(event.imageSource, 'event')
})

test('a story without any image still renders a picture', async () => {
  const repository = memoryRepository([story({ image: null, title: 'Kankarbagh gets a new park' })])
  const news = await selectHomeNews(repository, NOW)
  assert.equal(news.city.image, TRUSTED_FALLBACK_IMAGE.CITY)
})

/* ---------- 10: idempotent ingestion ------------------------------------- */

test('running ingestion twice creates no duplicates and keeps the feature', async () => {
  const repository = memoryRepository()
  const fetchHtml = async (url) => ogPage(`https://cdn.example.com/${encodeURIComponent(url).length}.jpg`)
  const first = await ingestBiharNews({ repository, anakin: fakeAnakin(), fetchHtml, now: NOW, log: silent })
  const count = repository.rows.length
  assert.equal(first.created, 2, 'metro (CITY) and the signing (SPORTS); the economy story is rejected')
  const city = repository.rows.find((row) => row.type === 'CITY')
  const sports = repository.rows.find((row) => row.type === 'SPORTS')
  assert.equal(city.title, 'Patna Metro announces new service on Blue Line')
  assert.equal(city.sourceName, 'Prabhat Khabar')
  assert.equal(city.imageSource, 'article-og')
  assert.equal(sports.title, 'Patna Pirates sign new raider ahead of PKL opener')
  assert.equal(sports.category, 'kabaddi')
  const featuredAt = city.featuredAt

  const later = new Date(NOW.getTime() + HOUR)
  const second = await ingestBiharNews({ repository, anakin: fakeAnakin(), fetchHtml, now: later, log: silent })
  assert.equal(second.created, 0)
  assert.equal(repository.rows.length, count)
  assert.deepEqual(repository.rows.find((row) => row.id === city.id).featuredAt, featuredAt, 're-running does not re-feature')
  assert.deepEqual(repository.rows.find((row) => row.id === city.id).lastSeenAt, later)
})

test('ingestion is due daily, and every six hours during an event', () => {
  assert.equal(ingestionDue(null, [], NOW), true)
  assert.equal(ingestionDue(hoursAgo(10), [], NOW), false)
  assert.equal(ingestionDue(hoursAgo(23.9), [], NOW), true)
  assert.equal(ingestionDue(hoursAgo(6), activeEvents(SANDHYA_ARGHYA), NOW), true)
})

test('official and local sources outrank unknown ones', () => {
  assert.equal(sourceTier('state.bihar.gov.in'), 'OFFICIAL')
  assert.equal(sourceTier('prabhatkhabar.com'), 'LOCAL')
  assert.equal(sourceTier('timesofindia.indiatimes.com'), 'NATIONAL')
  assert.equal(sourceTier('some-blog.example'), 'OTHER')
})

/* ---------- lessons from the first live run ------------------------------ */

test('real junk from the first live run is rejected', () => {
  const junk = [
    ['Gaya State Park', 'https://www.floridastateparks.org/parks-and-trails/gaya-state-park', 'A state park in Florida.'],
    ['Mithila Residential Parking Permit Zone', 'http://www.hayward-ca.gov/documents/mithila-residential-parking-permit-zone', 'City of Hayward, California.'],
    ['Patnagarh road collapse: Odisha orders probe', 'https://www.indiatoday.in/india/story/patnagarh-road-collapse-odisha-orders-probe-2997722', 'The district said…'],
    ['Latest T20 World Cup 2021 News, Photos, Latest News Headlines about T20 World Cup 2021-Sportstar', 'https://sportstar.thehindu.com/newstag/t20-world-cup-2021', 'Patna Bihar cricket'],
    ['Aizawl FC - latest team news & transfer rumours', 'https://www.goal.com/en-in/team/aizawl-fc/news/52oiz34tuvh22386o5gcgafiz', 'Bihar football'],
    ['Patna Pirates 32-28 Bengal Warriors (16 Dec, 2018) Final Score - ESPN (IN)', 'https://www.espn.in/kabaddi/match/_/gameId/527726/patna-pirates-bengal-warriors', ''],
    ['Jaipur Pink Panthers clinch Pro Kabaddi League 2024', 'https://newsonair.gov.in/jaipur-pink-panthers-clinch-pro-kabaddi-league-2024-25-title/', 'PKL kabaddi'],
    ['This day, that year: South Africa returns to international cricket after a 21', 'https://ddnews.gov.in/en/this-day-that-year-south-africa-returns-to-international-cricket-after-a-21-year-hiatus/', 'at Moin-ul-Haq in Patna'],
    ['Who won toss today? – Sport-net', 'https://sport-net.org/who-won-toss-today-16/', 'Bihar cricket match'],
  ]
  for (const [title, url, description] of junk) {
    assert.equal(assessStory({ title, url, description }, NOW).accepted, false, title)
  }
  /* while the real thing still passes */
  const ranji = assessStory({ title: 'Bihar vs Mumbai Ranji Trophy match at Moin-ul-Haq Stadium sold out', url: 'https://example.com/cricket/bihar-vs-mumbai-ranji-trophy-match-at-moin-ul-haq-stadium-sold-out' }, NOW)
  assert.equal(ranji.accepted && ranji.type, 'SPORTS')
  const season = assessStory({ title: 'Patna Pirates eye PKL 2026-27 title after opening win', url: 'https://example.com/kabaddi/patna-pirates-eye-pkl-title-after-opening-win' }, NOW)
  assert.equal(season.accepted, true)
})

test('publish dates are read from <time> tags and dates printed on the page', async () => {
  const { extractPublishedAt } = await import('../lib/news/ingest.ts')
  assert.equal(extractPublishedAt('<time datetime="2026-03-14T09:10:00+05:30">').toISOString(), '2026-03-14T03:40:00.000Z')
  const printed = extractPublishedAt('<div class="date">March 14, 2026 9:10 AM</div>')
  assert.equal(printed.getFullYear(), 2026)
  assert.equal(printed.getMonth(), 2)
  assert.equal(extractPublishedAt('<p>14 March 2026</p>').getDate(), 14)
  assert.equal(extractPublishedAt('<p>no date here</p>'), null)
})

test('an undated story cannot beat a dated fresh one on freshness alone', () => {
  const undated = story({ publishedAt: null, discoveredAt: NOW })
  const dated = story({ publishedAt: hoursAgo(6) })
  assert.ok(rankStory(dated, { now: NOW }).total > rankStory(undated, { now: NOW }).total)
})

test('pages without og:image use the photo captioned with the headline', async () => {
  const title = 'PM Modi to visit Bihar today to inaugurate projects'
  const html = `
    <img src="/logo.png" alt="Newsonair">
    <img src="https://newsonair.gov.in/wp-content/uploads/2026/09/other.png" alt="DUSU elections: Polling concludes">
    <img src="https://newsonair.gov.in/wp-content/uploads/2026/03/modiji.png" alt="${title}">`
  const image = await resolveStoryImage({ title, link: 'https://newsonair.gov.in/pm-modi-to-visit-bihar-today/', type: 'CITY' }, { fetchHtml: async () => html })
  assert.equal(image.image, 'https://newsonair.gov.in/wp-content/uploads/2026/03/modiji.png')
  assert.equal(image.imageSource, 'article')
})

/* ---------- lessons from production: fallback cards on Vercel --------------- */

test('HTML entity apostrophes in img alt still match the headline photo', async () => {
  const title = "IPL 2026: Chakravarthy overcomes surface tension to end KKR's losing streak"
  const html = `
    <img src="https://ddnews.gov.in/wp-content/themes/ddnews/assets/theme-assets/images/twitter-icon.svg" alt="Twitter">
    <img width="1600" height="900" src="https://ddnews.gov.in/wp-content/uploads/2026/04/Varun-Chakravarthy.jpg"
      class="attachment-full size-full" alt="IPL 2026: Chakravarthy overcomes surface tension to end KKR&#8217;s losing streak">`
  const image = await resolveStoryImage(
    { title, link: 'https://ddnews.gov.in/en/ipl-2026-chakravarthy-overcomes-surface-tension-to-end-kkrs-losing-streak', type: 'SPORTS' },
    { fetchHtml: async () => html },
  )
  assert.equal(image.image, 'https://ddnews.gov.in/wp-content/uploads/2026/04/Varun-Chakravarthy.jpg')
  assert.equal(image.imageSource, 'article')
})

test('WordPress featured images are used when the page has no og:image and no matching alt', async () => {
  const html = `
    <img src="https://ddnews.gov.in/wp-content/uploads/2024/04/dd-news-logo.png" class="custom-logo" alt="DD News">
    <img width="1600" height="900" src="https://ddnews.gov.in/wp-content/uploads/2026/04/Varun-Chakravarthy.jpg" class="attachment-full size-full wp-post-image" alt="">`
  const image = await resolveStoryImage(
    { title: 'IPL 2026: Chakravarthy ends KKR losing streak', link: 'https://ddnews.gov.in/en/ipl-2026-chakravarthy/', type: 'SPORTS' },
    { fetchHtml: async () => html },
  )
  assert.equal(image.image, 'https://ddnews.gov.in/wp-content/uploads/2026/04/Varun-Chakravarthy.jpg')
})

test('Anakin search results without image/thumbnail still resolve from article HTML', async () => {
  /* Anakin Search API returns url/title/snippet/date only — never image fields.
     searchImage must not be required for a correct photo. */
  const link = 'https://ddnews.gov.in/en/ipl-2026-chakravarthy-overcomes-surface-tension-to-end-kkrs-losing-streak'
  const title = "IPL 2026: Chakravarthy overcomes surface tension to end KKR's losing streak"
  const html = `<img class="wp-post-image" src="https://ddnews.gov.in/wp-content/uploads/2026/04/Varun-Chakravarthy.jpg" alt="${title}">`
  const image = await resolveStoryImage(
    { title, link, type: 'SPORTS', searchImage: null },
    { fetchHtml: async () => html },
  )
  assert.equal(image.imageSource, 'article')
  assert.ok(image.image.includes('Varun-Chakravarthy'))
})

test('recheck upgrades a fallback image via related coverage when the own page is unreachable', async () => {
  const broken = story({
    title: 'Patna Pirates raid their way to PKL victory at Patliputra Sports Complex',
    link: 'https://ddnews.gov.in/en/patna-pirates-raid-their-way-to-pkl-victory-at-patliputra-sports-complex/',
    sourceDomain: 'ddnews.gov.in',
    type: 'SPORTS',
    category: 'kabaddi',
    image: '/gandhi-maidan.jpg',
    imageSource: 'fallback',
    discoveredAt: hoursAgo(5),
  })
  const repository = memoryRepository([broken])
  const related = {
    url: 'https://www.prabhatkhabar.com/sports/kabaddi/patna-pirates-raid-their-way-to-pkl-victory-at-patliputra-sports-complex-pk2101999',
    title: 'Patna Pirates raid their way to PKL victory at Patliputra Sports Complex',
  }
  const anakin = {
    hasApiKey: true,
    async search() { return [related] },
    async scrapeHtml() { return null },
  }
  const pages = {
    [broken.link]: null,
    [related.url]: ogPage('https://img.prabhatkhabar.com/pirates.jpg'),
  }
  await ingestBiharNews({
    repository,
    anakin,
    fetchHtml: async (url) => pages[url] ?? null,
    now: NOW,
    log: silent,
  })
  assert.equal(repository.rows.find((row) => row.id === broken.id).image, 'https://img.prabhatkhabar.com/pirates.jpg')
  assert.equal(repository.rows.find((row) => row.id === broken.id).imageSource, 'anakin-related-coverage')
})

test('ingestion re-checks stored stories: junk and old undated ones are retired, images retried', async () => {
  const junk = story({ title: 'Gaya State Park', link: 'https://www.floridastateparks.org/parks-and-trails/gaya-state-park', sourceDomain: 'floridastateparks.org', discoveredAt: hoursAgo(5), publishedAt: null })
  const old = story({ title: 'PM Modi to visit Bihar today to inaugurate projects', link: 'https://newsonair.gov.in/pm-modi-to-visit-bihar-today-to-inaugurate-projects/', sourceDomain: 'newsonair.gov.in', discoveredAt: hoursAgo(5), publishedAt: null })
  const noImage = story({ title: 'Patna Metro extends Blue Line hours', link: 'https://www.prabhatkhabar.com/state/bihar/patna/patna-metro-extends-blue-line-hours-pk2101999', image: '/gandhi-setu.jpg', imageSource: 'fallback' })
  const repository = memoryRepository([junk, old, noImage])
  const pages = {
    [old.link]: '<div>March 14, 2026 9:10 AM</div>',
    [noImage.link]: ogPage('https://img.prabhatkhabar.com/blue.jpg'),
  }
  const summary = await ingestBiharNews({ repository, anakin: null, fetchHtml: async (url) => pages[url] ?? null, now: NOW, log: silent })
  const byId = (id) => repository.rows.find((row) => row.id === id)
  assert.equal(summary.retired, 2)
  assert.equal(byId(junk.id).isActive, false)
  assert.equal(byId(old.id).isActive, false)
  assert.equal(byId(noImage.id).image, 'https://img.prabhatkhabar.com/blue.jpg')
  assert.equal((await selectHomeNews(repository, NOW)).city.id, noImage.id)
})
