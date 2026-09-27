// @ts-nocheck
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { haversineDistanceKm } from './geo'
import { findCategory, normalizeText } from './taxonomy'
import { mohallas } from '@/prisma/seed-data.mjs'

const MOHALLAS = new Map(mohallas.map((name) => [normalizeText(name), name]))

const CATEGORY_NAMES = {
  cafes: 'Cafés',
  food: 'Food',
  places: 'Places',
  culture: 'Culture',
  shopping: 'Shopping',
  experiences: 'Experiences',
  outdoors: 'Outdoors',
}

function mapPlace(place) {
  return {
    id: place.id,
    slug: place.id,
    name: place.name,
    description: null,
    address: place.address,
    area: place.area,
    latitude: place.latitude,
    longitude: place.longitude,
    category: CATEGORY_NAMES[place.category] || 'Places',
    categorySlug: place.category || 'places',
    tags: place.primaryType ? [place.primaryType] : [],
    rating: null,
    ratingCount: null,
    website: place.website || null,
    socials: place.socials || [],
    brandName: place.brandName || null,
    brandWikidata: place.brandWikidata || null,
    image: null,
    provider: 'overture',
    providerPlaceId: place.id,
    attribution: 'Overture Maps Foundation',
    sourceConfidence: place.confidence,
    lastVerifiedAt: null,
  }
}

function tileKeysForBounds(bounds, tileSize) {
  const keys = []
  const west = Math.floor(bounds.west / tileSize)
  const east = Math.floor(bounds.east / tileSize)
  const south = Math.floor(bounds.south / tileSize)
  const north = Math.floor(bounds.north / tileSize)
  for (let x = west; x <= east; x += 1) {
    for (let y = south; y <= north; y += 1) keys.push(`${x}_${y}`)
  }
  return keys
}

function matches(place, { bounds, category, query }) {
  if (bounds && (
    place.longitude < bounds.west || place.longitude > bounds.east ||
    place.latitude < bounds.south || place.latitude > bounds.north
  )) return false
  const categoryMatch = findCategory(category)
  if (categoryMatch && place.category !== categoryMatch.slug) return false
  if (query) {
    const needle = normalizeText(query)
    const searchable = normalizeText(`${place.name} ${place.address || ''} ${place.area || ''} ${place.primaryType || ''}`)
    if (!searchable.includes(needle)) return false
  }
  return true
}

function stableHash(value) {
  let hash = 2166136261
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function discoveryOrder(left, right) {
  const leftBand = Math.floor((left.confidence || 0) * 10)
  const rightBand = Math.floor((right.confidence || 0) * 10)
  if (leftBand !== rightBand) return rightBand - leftBand
  return stableHash(left.id) - stableHash(right.id)
}

function interleaveCategories(places) {
  const categoryOrder = ['cafes', 'food', 'places', 'culture', 'shopping', 'experiences', 'outdoors']
  const groups = new Map(categoryOrder.map((category) => [category, []]))
  for (const place of places) {
    if (!groups.has(place.category)) groups.set(place.category, [])
    groups.get(place.category).push(place)
  }
  const ordered = []
  const positions = new Map([...groups.keys()].map((category) => [category, 0]))
  let added = true
  while (added) {
    added = false
    for (const [category, group] of groups) {
      const position = positions.get(category)
      if (position >= group.length) continue
      ordered.push(group[position])
      positions.set(category, position + 1)
      added = true
    }
  }
  return ordered
}

export class FilePlaceRepository {
  constructor({ directory = process.env.EXPLORE_CATALOG_DIR || join(process.cwd(), 'data', 'explore', 'catalog') } = {}) {
    this.directory = resolve(/* turbopackIgnore: true */ directory)
    this.manifestPath = join(this.directory, 'manifest.json')
    this.available = existsSync(this.manifestPath)
    this.manifest = this.available ? JSON.parse(readFileSync(this.manifestPath, 'utf8')) : null
    this.tileKeys = new Set(this.manifest?.tiles?.map((tile) => tile.key) || [])
    this.tileCache = new Map()
  }

  async loadTile(key) {
    if (!this.tileKeys.has(key)) return []
    if (!this.tileCache.has(key)) {
      this.tileCache.set(key, readFile(join(this.directory, 'tiles', `${key}.json`), 'utf8').then(JSON.parse))
    }
    return this.tileCache.get(key)
  }

  async recordsInBounds(bounds) {
    if (!this.available) return []
    const keys = tileKeysForBounds(bounds, this.manifest.tileSize).filter((key) => this.tileKeys.has(key))
    return (await Promise.all(keys.map((key) => this.loadTile(key)))).flat()
  }

  async withinBounds({ bounds, category, query, limit = 250, cursor = 0 }) {
    const records = await this.recordsInBounds(bounds)
    const filtered = interleaveCategories(records
      .filter((place) => matches(place, { bounds, category, query }))
      .sort(discoveryOrder))
    const offset = Math.max(0, Number(cursor) || 0)
    const page = filtered.slice(offset, offset + limit).map(mapPlace)
    const nextOffset = offset + page.length
    return {
      places: page,
      nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
      total: filtered.length,
    }
  }

  async search({ query, category, limit = 20, cursor = 0 }) {
    if (!this.available) return []
    const records = (await Promise.all([...this.tileKeys].map((key) => this.loadTile(key)))).flat()
    const needle = normalizeText(query)
    /* where the query matched: the name beats the address, so "medanta" finds the
       hospital before the cafés "opposite Medanta hospital" */
    const nameScore = (place) => {
      const name = normalizeText(place.name)
      if (name === needle) return 3
      if (name.startsWith(needle)) return 2
      if (` ${name}`.includes(` ${needle}`)) return 1.5
      return name.includes(needle) ? 1 : 0
    }
    return records
      .filter((place) => matches(place, { category, query }))
      .sort((left, right) => (nameScore(right) + right.confidence) - (nameScore(left) + left.confidence)
        || left.name.localeCompare(right.name))
      .slice(Math.max(0, Number(cursor) || 0), Math.max(0, Number(cursor) || 0) + limit)
      .map(mapPlace)
  }

  async nearby({ lat, lng, radiusKm = 5, category, limit = 20 }) {
    const latitudeDelta = radiusKm / 110.574
    const longitudeDelta = radiusKm / (111.32 * Math.max(Math.cos(lat * Math.PI / 180), 0.01))
    const bounds = {
      west: lng - longitudeDelta,
      east: lng + longitudeDelta,
      south: lat - latitudeDelta,
      north: lat + latitudeDelta,
    }
    const around = (await this.recordsInBounds(bounds))
      .filter((place) => matches(place, { bounds, category }))
      .map((place) => ({ ...place, distanceKm: haversineDistanceKm({ lat, lng }, { lat: place.latitude, lng: place.longitude }) }))
      .filter((place) => place.distanceKm <= radiusKm)
    /* 1,100 places sit within 1.5 km of Kankarbagh, so the nearest 120 are one street
       of shops: take the best-attested of each kind instead, nearest first among equals */
    const tier = (place) => (place.confidence >= 0.9 ? 0 : place.confidence >= 0.7 ? 1 : 2)
    return interleaveCategories(around.sort((left, right) => tier(left) - tier(right) || left.distanceKm - right.distanceKm))
      .slice(0, limit)
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .map((place) => ({ ...mapPlace(place), distanceKm: place.distanceKm }))
  }

  /* A mohalla ("Kankarbagh", "Kankarbagh, Patna") centred on the places whose
     addresses name it: the median, so a stray mis-geocoded address can't drag it */
  async areaFor(query) {
    const needle = normalizeText(query || '').replace(/[,.]/g, ' ').replace(/\b(patna|bihar)\b/g, '').replace(/\s+/g, ' ').trim()
    const name = MOHALLAS.get(needle)
    if (!this.available || !name) return null
    const records = (await Promise.all([...this.tileKeys].map((key) => this.loadTile(key)))).flat()
    const inArea = records.filter((place) => normalizeText(place.address || '').includes(needle))
    if (inArea.length < 5) return null
    const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
    return {
      name,
      address: null,
      latitude: median(inArea.map((place) => place.latitude)),
      longitude: median(inArea.map((place) => place.longitude)),
    }
  }
}

export class FallbackPlaceRepository {
  constructor(primary, fallback) {
    this.primary = primary
    this.fallback = fallback
  }

  async run(method, params, emptyValue) {
    if (this.primary.available !== false && typeof this.primary[method] === 'function') {
      try {
        return await this.primary[method](params)
      } catch (error) {
        console.error(`[places:primary] ${error?.code || error?.name || 'unavailable'}`)
      }
    }
    if (this.fallback.available !== false && typeof this.fallback[method] === 'function') {
      return this.fallback[method](params)
    }
    return emptyValue
  }

  async search(params) {
    return this.run('search', params, [])
  }

  async nearby(params) {
    return this.run('nearby', params, [])
  }

  async withinBounds(params) {
    return this.run('withinBounds', params, { places: [], nextCursor: null, total: 0 })
  }

  async areaFor(query) {
    return this.run('areaFor', query, null)
  }
}
