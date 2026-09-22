import { randomUUID } from 'node:crypto'
import { currentUserId } from '@/lib/auth'
import { databaseConfigured } from '@/lib/db/configured'
import { prisma } from '@/lib/db/prisma'
import { createStoryHandlers, type StoryRecord, type StoryRepository } from '@/lib/stories/stories'

export const dynamic = 'force-dynamic'

const prismaStories: StoryRepository = {
  listActive: (now, take) => prisma.story.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
    take,
  }),
  create: (data) => prisma.story.create({ data }),
}

/* without a database the wall lives in memory for the life of the process */
function memoryStories(): StoryRepository {
  const rows: StoryRecord[] = []
  return {
    async listActive(now, take) {
      return rows.filter((row) => row.expiresAt > now).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, take)
    },
    async create(data) {
      const row = { id: randomUUID(), ...data }
      rows.push(row)
      return row
    },
  }
}

const repository: StoryRepository = databaseConfigured() ? prismaStories : memoryStories()

const handlers = createStoryHandlers(repository)

/* anyone can read the active stories */
export async function GET() {
  return handlers.GET()
}

/* only a signed-in user can post one */
export async function POST(request: Request) {
  return handlers.POST(request, await currentUserId())
}
