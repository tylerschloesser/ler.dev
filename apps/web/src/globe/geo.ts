import { geoDistance, geoInterpolate, geoOrthographic } from 'd3-geo'
import { LOCATIONS, type LocationId } from '../data/races.ts'

/** [longitude, latitude] in degrees. */
export type LngLat = [number, number]
/** d3 projection rotation [λ, φ] in degrees; the globe never rolls, so no γ. */
export type Rotation = [number, number]

export const MAX_TILT = 60

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const rotationFor = ([lng, lat]: LngLat): Rotation => [-lng, -clamp(lat, -MAX_TILT, MAX_TILT)]

export const centerOf = ([λ, φ]: Rotation): LngLat => [-λ, -φ]

/** Continental US. */
export const DEFAULT_ROTATION = rotationFor([-98, 39])

/** Wraps λ into [-180, 180). */
export const normalizeLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180

export const isVisible = (coords: LngLat, rotation: Rotation) =>
  geoDistance(coords, centerOf(rotation)) < Math.PI / 2 - 0.01

/** Great-circle path from the current view to a point, as rotations for t in [0, 1]. */
export const flyPath = (from: Rotation, to: LngLat) => {
  const interpolate = geoInterpolate(centerOf(from), centerOf(rotationFor(to)))
  return (t: number) => rotationFor(interpolate(t))
}

/** Milliseconds for a fly of `distance` radians. */
export const flyDuration = (distance: number) => clamp(300 + distance * 700, 300, 1200)

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/** One screen pixel of drag turns the globe by one pixel of arc at its centre. */
export const dragRotation = (start: Rotation, dx: number, dy: number, radius: number, lockTilt: boolean): Rotation => {
  const k = 180 / (Math.PI * radius)
  const λ = start[0] + dx * k
  const φ = lockTilt ? start[1] : clamp(start[1] - dy * k, -MAX_TILT, MAX_TILT)
  return [λ, φ]
}

/** Everything the projection needs: where it looks, how close, and where on screen. */
export type View = { rotation: Rotation; scale: number; translate: [number, number] }
export type ViewMode = 'us' | 'globe'

/** The whole globe, centred on a location (or the US), filling the container. */
export const globeView = (location: LngLat | null, w: number, h: number): View => ({
  rotation: location ? rotationFor(location) : DEFAULT_ROTATION,
  scale: Math.max(0, Math.min(w, h) / 2 - 8),
  translate: [w / 2, h / 2],
})

/**
 * Extremes of the lower 48. The 49th parallel bows upward in orthographic, so
 * it gets several points. The fit uses these, not the lazily loaded states.
 */
export const US_OUTLINE: LngLat[] = [
  [-124.7, 48.4], // Cape Flattery
  [-124.6, 42.8], // Cape Blanco
  [-124.4, 40.4], // Cape Mendocino
  [-120.6, 34.5], // Point Conception
  [-117.1, 32.5], // San Diego
  [-97.2, 25.9], // Brownsville
  [-81.8, 24.5], // Key West
  [-80.1, 25.8], // Miami
  [-75.5, 35.2], // Cape Hatteras
  [-69.9, 41.7], // Cape Cod
  [-67.0, 44.8], // West Quoddy Head
  [-69.2, 47.45], // Northern Maine
  [-89.6, 48.0], // Minnesota Arrowhead
  [-95.15, 49.38], // Lake of the Woods
  [-104, 49],
  [-110, 49],
  [-116, 49],
  [-123, 49],
]

/** Share of the container left empty on each side of the fitted US. */
export const US_MARGIN = 0.1
/** Share of the distance to the container centre that the active race pans by. */
export const US_PAN = 0.25
/** The US never pans closer than this to the container edge. */
export const US_MIN_MARGIN = 0.02

const unitProjection = geoOrthographic().rotate(DEFAULT_ROTATION).scale(1).translate([0, 0])
const project = (coords: LngLat): [number, number] => unitProjection(coords) ?? [0, 0]

const usBounds = (() => {
  const points = US_OUTLINE.map(project)
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
})()

/** The lower 48 filling the container, nudged towards `location`. */
export const usView = (location: LngLat, w: number, h: number): View => {
  const { x0, x1, y0, y1 } = usBounds
  const scale = Math.max(0, Math.min((w * (1 - 2 * US_MARGIN)) / (x1 - x0), (h * (1 - 2 * US_MARGIN)) / (y1 - y0)))
  const fitX = w / 2 - (scale * (x0 + x1)) / 2
  const fitY = h / 2 - (scale * (y0 + y1)) / 2
  const [px, py] = project(location)
  // Pan towards the race, but keep every edge of the US at least US_MIN_MARGIN in.
  const panX = clamp(
    US_PAN * (w / 2 - (fitX + scale * px)),
    w * US_MIN_MARGIN - (fitX + scale * x0),
    w * (1 - US_MIN_MARGIN) - (fitX + scale * x1),
  )
  const panY = clamp(
    US_PAN * (h / 2 - (fitY + scale * py)),
    h * US_MIN_MARGIN - (fitY + scale * y0),
    h * (1 - US_MIN_MARGIN) - (fitY + scale * y1),
  )
  return { rotation: DEFAULT_ROTATION, scale, translate: [fitX + panX, fitY + panY] }
}

export const viewModeFor = (id: LocationId | null): ViewMode => (id && !('country' in LOCATIONS[id]) ? 'us' : 'globe')

/** Where the globe should be for the active location in a w × h container. */
export const targetView = (id: LocationId | null, w: number, h: number): View => {
  if (!id) return globeView(null, w, h)
  const { lat, lng } = LOCATIONS[id]
  return viewModeFor(id) === 'us' ? usView([lng, lat], w, h) : globeView([lng, lat], w, h)
}

/** Fly along the great circle, zoom geometrically, pan linearly. */
export const interpolateView = (from: View, to: View) => {
  const rotation = flyPath(from.rotation, centerOf(to.rotation))
  const s0 = Math.max(from.scale, 1e-6)
  const ratio = Math.max(to.scale, 1e-6) / s0
  return (t: number): View => ({
    rotation: rotation(t),
    scale: s0 * ratio ** t,
    translate: [
      from.translate[0] + (to.translate[0] - from.translate[0]) * t,
      from.translate[1] + (to.translate[1] - from.translate[1]) * t,
    ],
  })
}

const rotationDistance = (a: View, b: View) => geoDistance(centerOf(a.rotation), centerOf(b.rotation))
const zooms = (a: View, b: View) => Math.abs(Math.log(Math.max(b.scale, 1e-6) / Math.max(a.scale, 1e-6))) > 0.01
const pans = (a: View, b: View) => Math.hypot(b.translate[0] - a.translate[0], b.translate[1] - a.translate[1]) > 0.5

export const sameView = (a: View, b: View) => rotationDistance(a, b) < 1e-3 && !zooms(a, b) && !pans(a, b)

/** Like flyDuration, but zooms and pans get enough time to read as motion. */
export const viewDuration = (from: View, to: View) => {
  const fly = flyDuration(rotationDistance(from, to))
  if (zooms(from, to)) return Math.max(fly, 800)
  if (pans(from, to)) return Math.max(fly, 500)
  return fly
}
