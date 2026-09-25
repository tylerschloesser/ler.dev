import { geoDistance, geoInterpolate } from 'd3-geo'

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
