import { existsSync, readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const envPath = ['.env.local', '.env'].find((path) => existsSync(path))
if (envPath) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const eq = trimmed.indexOf('=')
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const prisma = new PrismaClient()

import {
  news, marketplace, places, exploreCategories, placeCategoryByType, ghats, regions, communities, transport, tinderProfiles,
} from './seed-data.mjs'

async function seed() {
  await prisma.placeInteraction.deleteMany()
  await prisma.exploreSearch.deleteMany()
  await prisma.experience.deleteMany()
  await prisma.collectionItem.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.placePhoto.deleteMany()
  await prisma.placeSource.deleteMany()
  await prisma.placeCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.news.deleteMany()
  await prisma.marketplaceItem.deleteMany()
  await prisma.place.deleteMany()
  await prisma.ghat.deleteMany()
  await prisma.region.deleteMany()
  await prisma.community.deleteMany()
  await prisma.transport.deleteMany()
  await prisma.tinderProfile.deleteMany()

  await prisma.news.createMany({ data: news })
  await prisma.marketplaceItem.createMany({ data: marketplace })
  await prisma.category.createMany({ data: exploreCategories })
  await prisma.place.createMany({ data: places })
  const [categoryRows, placeRows] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.place.findMany({ select: { id: true, type: true } }),
  ])
  const categoryIds = new Map(categoryRows.map((category) => [category.slug, category.id]))
  const placeCategories = placeRows
    .map((place) => {
      const categoryId = categoryIds.get(placeCategoryByType[place.type])
      return categoryId ? { placeId: place.id, categoryId, source: 'seed', confidence: 1 } : null
    })
    .filter(Boolean)
  if (placeCategories.length) await prisma.placeCategory.createMany({ data: placeCategories })
  await prisma.ghat.createMany({ data: ghats })
  await prisma.region.createMany({ data: regions })
  await prisma.community.createMany({ data: communities })
  await prisma.transport.createMany({ data: transport })
  await prisma.tinderProfile.createMany({ data: tinderProfiles })

  console.log('Supabase seed complete')
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
