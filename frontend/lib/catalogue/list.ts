import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { toClient } from '@/lib/serialize'
import * as seed from '@/prisma/seed-data.mjs'

export const CATALOGUE_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600'
export const MEMORY_TTL_MS = 30_000
export const DEFAULT_LIMIT = 100
export const MAX_LIMIT = 500

type FindManyDelegate = {
  findMany: (args: { orderBy: { createdAt: 'desc' }; take: number }) => Promise<unknown[]>
}

/* ---------- running without a database ------------------------------------
   A copy with no DATABASE_URL (a first `npm run dev`, a preview) still has the
   whole seeded catalogue on disk. Each catalogue route asks for its source
   here: Postgres when there is one, otherwise the rows `db:seed` would write,
   given stable ids so the client's _id alias and keys behave the same.       */

const SEED: Record<string, readonly Record<string, unknown>[]> = {
  marketplace: seed.marketplace,
  places: seed.places,
  ghats: seed.ghats,
  regions: seed.regions,
  communities: seed.communities,
  transport: seed.transport,
  'tinder-profiles': seed.tinderProfiles,
}

export type SeedKey = keyof typeof SEED

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

export function catalogueSource(delegate: FindManyDelegate, key: SeedKey): FindManyDelegate {
  if (databaseConfigured()) return delegate
  const rows = (SEED[key] ?? []).map((row, index) => ({
    id: `seed-${key}-${index + 1}`,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    ...row,
  }))
  return { findMany: async ({ take }) => rows.slice(0, take) }
}

export function parseLimit(searchParams: URLSearchParams): number {
  const requested = Number.parseInt(searchParams.get('limit') ?? '', 10)
  return Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT
}

export async function listCatalogue(delegate: FindManyDelegate, cacheKey: string, take: number) {
  return cached(`${cacheKey}:${take}`, MEMORY_TTL_MS, async () => {
    const rows = await delegate.findMany({ orderBy: { createdAt: 'desc' }, take })
    return toClient(rows)
  })
}

export async function catalogueJsonResponse(
  delegate: FindManyDelegate,
  cacheKey: string,
  searchParams: URLSearchParams,
) {
  try {
    const take = parseLimit(searchParams)
    const payload = await listCatalogue(delegate, cacheKey, take)
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': CATALOGUE_CACHE_CONTROL },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
