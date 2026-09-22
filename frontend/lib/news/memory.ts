import { randomUUID } from 'node:crypto'
import type { DuplicateKeys, NewsRecord, NewsRepository, NewsWrite } from './repository'

/* ==========================================================================
   The news table without a database: the same NewsRepository over an array,
   with the Prisma repository's ordering rules, so Home, /api/news and the
   ingestion cron behave identically for the life of the process. Used when
   DATABASE_URL is unset (lib/news/server.ts); the tests keep their own copy.
   ========================================================================== */

const time = (value: Date | null | undefined) => (value ? value.getTime() : null)

/* publishedAt desc with nulls last, then createdAt desc — as Prisma orders latestOfType */
function byPublishedThenCreated(left: NewsRecord, right: NewsRecord) {
  const l = time(left.publishedAt)
  const r = time(right.publishedAt)
  if (l !== null && r !== null && l !== r) return r - l
  if (l === null && r !== null) return 1
  if (l !== null && r === null) return -1
  return right.createdAt.getTime() - left.createdAt.getTime()
}

export function createMemoryNewsRepository(initial: NewsRecord[] = []): NewsRepository {
  const rows: NewsRecord[] = initial.map((row) => ({ ...row }))

  return {
    async findDuplicate({ canonicalUrl, titleKey, contentHash }: DuplicateKeys) {
      for (const [key, value] of [
        ['canonicalUrl', canonicalUrl],
        ['titleKey', titleKey],
        ['contentHash', contentHash],
      ] as const) {
        if (!value) continue
        const row = rows.find((entry) => entry[key] === value)
        if (row) return { ...row }
      }
      return null
    },
    async create(data) {
      const now = new Date()
      const row: NewsRecord = {
        id: randomUUID(),
        description: null, image: null, imageSource: null, imageSourceUrl: null, link: null,
        canonicalUrl: null, titleKey: null, contentHash: null, sourceName: null, sourceDomain: null,
        publishedAt: null, discoveredAt: now, lastSeenAt: null, type: 'CITY', category: null,
        eventSlug: null, eventPhase: null, score: 0, isActive: true, featuredAt: null,
        cooldownUntil: null, expiresAt: null,
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      rows.push(row)
      return { ...row }
    },
    async update(id, data: NewsWrite) {
      const index = rows.findIndex((row) => row.id === id)
      if (index < 0) throw new Error(`news row ${id} not found`)
      rows[index] = { ...rows[index], ...data, updatedAt: new Date() }
      return { ...rows[index] }
    },
    async deactivateExpired(now) {
      let count = 0
      for (const row of rows) {
        if ((row.type === 'CITY' || row.type === 'SPORTS') && row.isActive && row.expiresAt && row.expiresAt <= now) {
          row.isActive = false
          count++
        }
      }
      return count
    },
    async listRecent(types, since) {
      return rows
        .filter((row) => types.includes(row.type) && row.isActive
          && (row.publishedAt ? row.publishedAt >= since : row.discoveredAt >= since))
        .sort((left, right) => right.discoveredAt.getTime() - left.discoveredAt.getTime())
        .slice(0, 200)
        .map((row) => ({ ...row }))
    },
    async latestOfType(type, { activeOnly = false } = {}) {
      const match = rows
        .filter((row) => row.type === type && (!activeOnly || row.isActive))
        .sort(byPublishedThenCreated)[0]
      return match ? { ...match } : null
    },
    async lastIngestedAt() {
      const seen = rows.map((row) => time(row.lastSeenAt)).filter((value): value is number => value !== null)
      return seen.length ? new Date(Math.max(...seen)) : null
    },
  }
}
