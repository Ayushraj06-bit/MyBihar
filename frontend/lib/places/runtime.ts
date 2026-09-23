// @ts-nocheck
import { prisma } from '@/lib/db/prisma'
import { OlaPlacesProvider } from './olaPlacesProvider'
import { createPlaceSearchService } from './placeSearchService'
import { FallbackPlaceRepository, FilePlaceRepository } from './filePlaceRepository'
import { PrismaPlaceRepository } from './prismaPlaceRepository'
import { SeedPlaceRepository } from './seedPlaceRepository'

/* Postgres, then a catalogue export on disk, then the seeded Bihar places —
   so Explore still has something to show on a copy with neither. */
export const placeRepository = new FallbackPlaceRepository(
  new PrismaPlaceRepository(prisma),
  new FallbackPlaceRepository(new FilePlaceRepository(), new SeedPlaceRepository()),
)

export const placeSearchService = createPlaceSearchService({
  repository: placeRepository,
  provider: new OlaPlacesProvider(),
})
