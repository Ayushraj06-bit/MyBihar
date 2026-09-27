// @ts-nocheck
import { prisma } from '@/lib/db/prisma'
import { OlaPlacesProvider } from './olaPlacesProvider'
import { FallbackPlacesProvider, PhotonPlacesProvider } from './photonPlacesProvider'
import { createPlaceSearchService } from './placeSearchService'
import { FallbackPlaceRepository, FilePlaceRepository } from './filePlaceRepository'
import { PrismaPlaceRepository } from './prismaPlaceRepository'
import { CuratedCatalogue, SeedPlaceRepository } from './seedPlaceRepository'

/* Postgres; without it, the curated Bihar places on top of the Overture
   catalogue on disk (scripts/import-overture-places.mjs). */
export const placeRepository = new FallbackPlaceRepository(
  new PrismaPlaceRepository(prisma),
  new CuratedCatalogue(new SeedPlaceRepository(), new FilePlaceRepository()),
)

export const placeSearchService = createPlaceSearchService({
  repository: placeRepository,
  /* Ola when its key works, OpenStreetMap otherwise — search never collapses to the seed */
  provider: new FallbackPlacesProvider(new OlaPlacesProvider(), new PhotonPlacesProvider()),
})
