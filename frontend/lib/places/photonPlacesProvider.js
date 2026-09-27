// @ts-nocheck
import { cached } from '@/lib/cache'
import { haversineDistanceKm } from './geo'
import { normalizeProviderPlace } from './normalizePlace'
import { findCategory, normalizeText } from './taxonomy'

/* ==========================================================================
   Place search that needs no key: OpenStreetMap through the public Photon
   instance. Measured on 24 real Patna queries it found 20 — chains, hotels,
   hospitals, banks, stations, parks — where the seeded catalogue has 16
   places in all. Results pass through normalizeProviderPlace, so they have
   exactly the shape Ola's do.

   ponytail: public photon.komoot.io is fair-use only; self-host Photon (one
   docker image) if traffic grows.
   ========================================================================== */

const PHOTON = 'https://photon.komoot.io/api/'
const CACHE_MS = 5 * 60 * 1000
/* generous Bihar box: Photon biases by distance but still returns the world */
const BIHAR = { south: 24.3, north: 27.6, west: 83.3, east: 88.3 }
/* what to ask OSM for when the visitor picked a kind of place, not a name */
const CATEGORY_QUERY = {
  cafes: 'cafe', food: 'restaurant', places: 'tourist attraction', culture: 'museum',
  shopping: 'mall', experiences: 'cinema', outdoors: 'park',
}

/* the box also takes in Gorakhpur and the Terai, so the state Photon names decides */
function inBihar({ properties, geometry: { coordinates: [lng, lat] } }) {
  return (!properties.state || properties.state === 'Bihar')
    && lat > BIHAR.south && lat < BIHAR.north && lng > BIHAR.west && lng < BIHAR.east
}

function toPlace({ properties: p, geometry }) {
  const [lng, lat] = geometry.coordinates
  const street = p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street
  return normalizeProviderPlace({
    place_id: `osm:${p.osm_type}${p.osm_id}`,
    name: p.name,
    formatted_address: [street, p.district || p.locality, p.city || p.county, p.state].filter(Boolean).join(', '),
    geometry: { location: { lat, lng } },
    types: [p.osm_value, p.osm_key],
  }, 'osm')
}

export class PhotonPlacesProvider {
  name = 'osm'
  configured = true

  async query(text, { lat, lng, limit }) {
    const url = new URL(PHOTON)
    url.searchParams.set('q', text)
    url.searchParams.set('lang', 'en')
    /* over-fetch: the Bihar filter below drops the rest of the world */
    url.searchParams.set('limit', String(Math.min(limit * 2, 40)))
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      url.searchParams.set('lat', String(lat))
      url.searchParams.set('lon', String(lng))
    }
    return cached(`photon:${url.search}`, CACHE_MS, async () => {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MyBihar/1.0 (+https://github.com/Ayushraj06-bit/MyBihar)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`Photon responded ${res.status}`)
      const { features = [] } = await res.json()
      /* an OSM feature "named" hospital or cafe is an unnamed one — no use as a result */
      const named = (p) => p?.name && normalizeText(p.name) !== normalizeText(p.osm_value || '')
      /* OSM often maps one station as a node, a way and a stop: keep the first of
         any same-name results within 300 m of each other */
      const kept = []
      for (const place of features.filter((f) => named(f.properties) && inBihar(f)).map(toPlace)) {
        const here = { lat: place.latitude, lng: place.longitude }
        const twin = kept.some((k) => normalizeText(k.name) === normalizeText(place.name)
          && haversineDistanceKm(here, { lat: k.latitude, lng: k.longitude }) < 0.3)
        if (!twin) kept.push(place)
      }
      return kept
    })
  }

  async search({ query, lat, lng, limit = 20 }) {
    return (await this.query(query, { lat, lng, limit })).slice(0, limit)
  }

  /* OSM has no "everything near here" query; a kind of place is required */
  async nearby({ lat, lng, radiusKm = 5, category, limit = 20 }) {
    const term = CATEGORY_QUERY[findCategory(category)?.slug]
    if (!term) return []
    return (await this.query(term, { lat, lng, limit }))
      .map((place) => ({ ...place, distanceKm: haversineDistanceKm({ lat, lng }, { lat: place.latitude, lng: place.longitude }) }))
      .filter((place) => place.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit)
  }
}

/* Ola first — best India coverage once its key works; OSM whenever Ola is
   unconfigured or refusing. The search service sees one provider. */
export class FallbackPlacesProvider {
  constructor(primary, fallback) {
    this.primary = primary
    this.fallback = fallback
    this.name = primary.name
  }

  get configured() {
    return this.primary.configured || this.fallback.configured
  }

  async run(method, params) {
    if (this.primary.configured) {
      try {
        return await this.primary[method](params)
      } catch (error) {
        console.warn(`[places:${this.primary.name}] ${error.message} — answering from ${this.fallback.name}`)
      }
    }
    return this.fallback[method](params)
  }

  search(params) { return this.run('search', params) }
  nearby(params) { return this.run('nearby', params) }
}
