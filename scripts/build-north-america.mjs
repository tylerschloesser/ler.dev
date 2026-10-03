// Builds apps/web/src/globe/north-america.json: international land borders
// (world-atlas countries-50m) and large lakes (Natural Earth ne_50m_lakes),
// clipped to North America. Both sources are public domain.
//
//   node scripts/build-north-america.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const web = fileURLToPath(new URL('../apps/web/', import.meta.url))
const require = createRequire(web)
const { mesh } = require('topojson-client')
const { geoArea, geoBounds } = await import(require.resolve('d3-geo'))

const LAKES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson'
const BBOX = { west: -170, east: -50, south: 5, north: 85 }
/** Lakes smaller than this (km²) vanish at US zoom anyway. */
const MIN_LAKE_KM2 = 1500
/** Lakes outside these latitudes never show at US zoom. */
const LAKES_SOUTH = 20
const LAKES_NORTH = 56
/** Lines drop points closer than this (degrees) to the last kept one. */
const BORDER_STEP = 0.03
const LAKE_STEP = 0.08
const EARTH_RADIUS_KM = 6371

const round = (n) => Math.round(n * 100) / 100
const inBox = ([lng, lat]) => lng >= BBOX.west && lng <= BBOX.east && lat >= BBOX.south && lat <= BBOX.north

/** Rounds to 0.01° and drops points within `step` of the last kept one (keeping the end). */
const roundLine = (line, step = 0) => {
  const out = []
  line.forEach(([lng, lat], i) => {
    const point = [round(lng), round(lat)]
    const last = out.at(-1)
    const end = i === line.length - 1
    if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) > (end ? 0 : step)) out.push(point)
  })
  return out
}

// Borders: split every line into runs of points inside the box.
const countries = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'))
const borderMesh = mesh(countries, countries.objects.countries, (a, b) => a !== b)
const borderLines = []
for (const line of borderMesh.coordinates) {
  let run = []
  for (const point of line) {
    if (inBox(point)) run.push(point)
    else {
      if (run.length > 1) borderLines.push(run)
      run = []
    }
  }
  if (run.length > 1) borderLines.push(run)
}
const borders = borderLines.map((line) => roundLine(line, BORDER_STEP)).filter((line) => line.length > 1)

// Lakes: whole polygons whose bounds sit inside the box.
const lakesGeo = await (await fetch(LAKES_URL)).json()
const lakes = []
const kept = []
for (const f of lakesGeo.features) {
  const [[w, s], [e, n]] = geoBounds(f)
  if (!inBox([w, s]) || !inBox([e, n]) || s < LAKES_SOUTH || n > LAKES_NORTH) continue
  const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (let polygon of polygons) {
    polygon = polygon.map((ring) => roundLine(ring, LAKE_STEP)).filter((ring) => ring.length >= 4)
    if (!polygon.length) continue
    // d3 wants clockwise exterior rings; a ring the wrong way round covers the rest of the globe.
    let area = geoArea({ type: 'Polygon', coordinates: polygon })
    if (area > 2 * Math.PI) {
      polygon = polygon.map((ring) => ring.toReversed())
      area = geoArea({ type: 'Polygon', coordinates: polygon })
    }
    if (area * EARTH_RADIUS_KM ** 2 < MIN_LAKE_KM2) continue
    lakes.push(polygon)
    kept.push(f.properties.name ?? '?')
  }
}

const out = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 'borders', properties: {}, geometry: { type: 'MultiLineString', coordinates: borders } },
    { type: 'Feature', id: 'lakes', properties: {}, geometry: { type: 'MultiPolygon', coordinates: lakes } },
  ],
}
const path = fileURLToPath(new URL('src/globe/north-america.json', `file://${web}`))
writeFileSync(path, JSON.stringify(out) + '\n')
console.log(`${borders.length} border lines, ${lakes.length} lakes: ${[...new Set(kept)].join(', ')}`)
console.log(`wrote ${path} (${(JSON.stringify(out).length / 1024).toFixed(1)} KB)`)
