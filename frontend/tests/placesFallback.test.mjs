// Search falls back from Ola to OpenStreetMap, and OSM results are cleaned
// to the same standard: Bihar only, real names, one entry per place.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FallbackPlacesProvider, PhotonPlacesProvider } from '../lib/places/photonPlacesProvider.js'

const feature = (name, osm_value, lat, lng, id) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { name, osm_value, osm_key: 'amenity', osm_type: 'N', osm_id: id, city: 'Patna', state: 'Bihar' },
})

test('Ola answers when it works; OSM answers when Ola throws or has no key', async () => {
  const osm = { name: 'osm', configured: true, search: async () => ['from osm'], nearby: async () => [] }
  const working = { name: 'ola', configured: true, search: async () => ['from ola'] }
  const refusing = { name: 'ola', configured: true, search: async () => { throw new Error('401') } }
  const keyless = { name: 'ola', configured: false, search: async () => ['never'] }
  assert.deepEqual(await new FallbackPlacesProvider(working, osm).search({}), ['from ola'])
  assert.deepEqual(await new FallbackPlacesProvider(refusing, osm).search({}), ['from osm'])
  assert.deepEqual(await new FallbackPlacesProvider(keyless, osm).search({}), ['from osm'])
})

test('OSM results stay in Bihar, drop unnamed features and collapse same-name neighbours', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ features: [
      feature("Domino's", 'fast_food', 25.6100, 85.1400, 1),
      feature("Domino's", 'fast_food', 25.6105, 85.1402, 2), // same branch mapped twice, ~60 m apart
      feature("Domino's", 'fast_food', 25.5500, 85.0900, 3), // a different branch, km away — kept
      feature('hospital', 'hospital', 25.6000, 85.1300, 4), // unnamed feature
      feature("Domino's", 'fast_food', 12.9716, 77.5946, 5), // Bangalore
    ] }),
  })
  try {
    const rows = await new PhotonPlacesProvider().search({ query: `dominos-${Date.now()}`, lat: 25.59, lng: 85.13 })
    assert.equal(rows.length, 2)
    assert.ok(rows.every((row) => row.name === "Domino's" && row.provider === 'osm' && row.categorySlug === 'food'))
  } finally {
    globalThis.fetch = original
  }
})
