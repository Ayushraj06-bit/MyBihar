import { prisma } from '@/lib/db/prisma'
import { catalogueJsonResponse, catalogueSource } from '@/lib/catalogue/list'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return catalogueJsonResponse(catalogueSource(prisma.region, 'regions'), 'regions', searchParams)
}
