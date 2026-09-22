import { prisma } from '@/lib/db/prisma'
import { databaseConfigured } from '@/lib/db/configured'
import { createMemoryNewsRepository } from './memory'
import { createPrismaNewsRepository } from './repository'

/* Postgres when there is one; otherwise an in-memory table for the life of the
   process, so Home serves its fallback cards without ever asking Prisma. */
export const newsRepository = databaseConfigured()
  ? createPrismaNewsRepository(prisma)
  : createMemoryNewsRepository()
