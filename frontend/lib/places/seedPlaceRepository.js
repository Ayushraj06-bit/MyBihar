// @ts-nocheck
import { haversineDistanceKm } from './geo'
import { findCategory, normalizeText } from './taxonomy'
import { places as SEED_PLACES, placeCategoryByType } from '@/prisma/seed-data.mjs'

/* ==========================================================================
   Explore without a database, a catalogue export or a Places provider.

   The last link in the chain (PrismaPlaceRepository → FilePlaceRepository →
   this): a copy with no DATABASE_URL, no data/explore/catalog and no working
   OLA_MAPS_API_KEY would otherwise show "0 places". The seeded Bihar places
   already carry names, coordinates, photographs and descriptions, so Explore
   shows real content offline instead of an empty map.
   ========================================================================== */

const CATEGORY_NAMES = {
  cafes: 'Cafés',
  food: 'Food',
  places: 'Places',
  culture: 'Culture',
  shopping: 'Shopping',
  experiences: 'Experiences',
  outdoors: 'Outdoors',
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/* the seed rows, in the shape placeSearchService and the map expect */
const RECORDS = SEED_PLACES.map((place, index) => {
  const categorySlug = placeCategoryByType[place.type] || 'places'
  const id = place.slug || slugify(place.name) || `seed-place-${index + 1}`
  return {
    id,
    slug: id,
    name: place.name,
    description: place.description ?? null,
    address: place.address || [place.area, place.location, 'Bihar'].filter(Boolean).join(', '),
    area: place.area || place.location || null,
    latitude: typeof place.latitude === 'number' ? place.latitude : null,
    longitude: typeof place.longitude === 'number' ? place.longitude : null,
    category: CATEGORY_NAMES[categorySlug] || 'Places',
    categorySlug,
    tags: place.tags || [],
    rating: typeof place.rating === 'number' ? place.rating : null,
    ratingCount: null,
    website: null,
    socials: [],
    brandName: null,
    brandWikidata: null,
    image: place.image || null,
    status: place.status || null,
    provider: 'mybihar-seed',
    providerPlaceId: id,
    attribution: 'MyBihar seeded catalogue',
    sourceConfidence: typeof place.sourceConfidence === 'number' ? place.sourceConfidence : 0.6,
    lastVerifiedAt: null,
  }
})

const LOCATABLE = RECORDS.filter((place) => place.latitude !== null && place.longitude !== null)

function matches(place, { bounds, category, query }) {
  if (bounds) {
    if (place.longitude === null || place.latitude === null) return false
    if (place.longitude < bounds.west || place.longitude > bounds.east) return false
    if (place.latitude < bounds.south || place.latitude > bounds.north) return false
  }
  const categoryMatch = findCategory(category)
  if (categoryMatch && place.categorySlug !== categoryMatch.slug) return false
  if (query) {
    const needle = normalizeText(query)
    const searchable = normalizeText(
      `${place.name} ${place.address || ''} ${place.area || ''} ${(place.tags || []).join(' ')} ${place.description || ''}`,
    )
    if (!searchable.includes(needle)) return false
  }
  return true
}

export class SeedPlaceRepository {
  constructor() {
    this.available = RECORDS.length > 0
  }

  async withinBounds({ bounds, category, query, limit = 250, cursor = 0 }) {
    const filtered = LOCATABLE
      .filter((place) => matches(place, { bounds, category, query }))
      .sort((left, right) => right.sourceConfidence - left.sourceConfidence || left.name.localeCompare(right.name))
    const offset = Math.max(0, Number(cursor) || 0)
    const page = filtered.slice(offset, offset + limit)
    const nextOffset = offset + page.length
    return {
      places: page,
      nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
      total: filtered.length,
    }
  }

  async search({ query, category, limit = 20, cursor = 0 }) {
    const needle = normalizeText(query || '')
    const offset = Math.max(0, Number(cursor) || 0)
    return RECORDS
      .filter((place) => matches(place, { category, query }))
      .sort((left, right) => {
        const leftName = normalizeText(left.name)
        const rightName = normalizeText(right.name)
        const score = (name) => (name === needle ? 3 : name.startsWith(needle) ? 2 : 1)
        return (score(rightName) + right.sourceConfidence) - (score(leftName) + left.sourceConfidence)
          || left.name.localeCompare(right.name)
      })
      .slice(offset, offset + limit)
  }

  async nearby({ lat, lng, radiusKm = 5, category, limit = 20 }) {
    return LOCATABLE
      .filter((place) => matches(place, { category }))
      .map((place) => ({
        ...place,
        distanceKm: haversineDistanceKm({ lat, lng }, { lat: place.latitude, lng: place.longitude }),
      }))
      .filter((place) => place.distanceKm <= radiusKm)
      .sort((left, right) => left.distanceKm - right.distanceKm || right.sourceConfidence - left.sourceConfidence)
      .slice(0, limit)
  }
}
