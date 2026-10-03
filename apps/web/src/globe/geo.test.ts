import { geoDistance, geoOrthographic } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import { LOCATIONS, type LocationId } from '../data/races.ts'
import {
  US_CENTER,
  US_NUDGE,
  US_OUTLINE,
  globeView,
  interpolateView,
  targetView,
  usView,
  viewDuration,
  type Frame,
  type View,
  DEFAULT_ROTATION,
  MAX_TILT,
  centerOf,
  dragRotation,
  easeInOutCubic,
  flyDuration,
  flyPath,
  isVisible,
  normalizeLng,
  rotationFor,
  type LngLat,
} from './geo.ts'

const chicago: LngLat = [-87.63, 41.88]

describe('rotationFor / centerOf', () => {
  it('round-trip', () => {
    expect(centerOf(rotationFor(chicago))).toEqual(chicago)
    expect(rotationFor(centerOf([30, -20]))).toEqual([30, -20])
  })

  it('clamps tilt to ±60°', () => {
    expect(rotationFor([0, 89])).toEqual([-0, -MAX_TILT])
    expect(rotationFor([0, -89])).toEqual([-0, MAX_TILT])
  })
})

describe('isVisible', () => {
  it('shows the US from the default view', () => {
    expect(isVisible(chicago, DEFAULT_ROTATION)).toBe(true)
    expect(isVisible([-122.33, 47.61], DEFAULT_ROTATION)).toBe(true)
  })

  it('hides the US from the far side', () => {
    expect(isVisible(chicago, rotationFor([80, 0]))).toBe(false)
  })
})

describe('flyPath', () => {
  it('starts at the current view and ends on the target', () => {
    const path = flyPath(DEFAULT_ROTATION, chicago)
    const [λ0, φ0] = path(0)
    expect(λ0).toBeCloseTo(DEFAULT_ROTATION[0])
    expect(φ0).toBeCloseTo(DEFAULT_ROTATION[1])
    const [λ1, φ1] = path(1)
    expect(λ1).toBeCloseTo(87.63)
    expect(φ1).toBeCloseTo(-41.88)
  })
})

describe('flyDuration', () => {
  it('is clamped to 300–1200ms', () => {
    expect(flyDuration(0)).toBe(300)
    expect(flyDuration(Math.PI)).toBe(1200)
  })
})

describe('easeInOutCubic', () => {
  it('fixes 0 and 1 and never goes backwards', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    let previous = 0
    for (let t = 0.01; t <= 1; t += 0.01) {
      const value = easeInOutCubic(t)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })
})

describe('dragRotation', () => {
  const radius = 200

  it('turns by one pixel of arc per pixel dragged', () => {
    const [λ, φ] = dragRotation([0, 0], Math.PI * radius, -10, radius, false)
    expect(λ).toBeCloseTo(180)
    expect(φ).toBeGreaterThan(0)
  })

  it('keeps tilt when locked', () => {
    expect(dragRotation([10, -20], 50, 300, radius, true)[1]).toBe(-20)
  })

  it('clamps tilt when unlocked', () => {
    expect(dragRotation([0, 0], 0, -10_000, radius, false)[1]).toBe(MAX_TILT)
  })
})

describe('normalizeLng', () => {
  it('wraps into [-180, 180)', () => {
    expect(normalizeLng(190)).toBe(-170)
    expect(normalizeLng(-190)).toBe(170)
    expect(normalizeLng(87.6)).toBeCloseTo(87.6)
  })
})

const FRAMES: [string, Frame][] = [
  ['desktop', { x: 0, y: 0, w: 720, h: 900 }],
  ['mobile', { x: 0, y: 0, w: 412, h: 360 }],
  ['wide', { x: 0, y: 0, w: 1400, h: 600 }],
  // The left column of a full-bleed 1280-wide svg.
  ['offset', { x: 120, y: 0, w: 540, h: 900 }],
]
const DESKTOP: Frame = FRAMES[0][1]

const US_IDS = (Object.keys(LOCATIONS) as LocationId[]).filter((id) => !('country' in LOCATIONS[id]))

const projectWith = (view: View, coords: LngLat) =>
  geoOrthographic().rotate(view.rotation).scale(view.scale).translate(view.translate)(coords)!

describe('usView', () => {
  for (const [name, frame] of FRAMES) {
    const { x: fx, y: fy, w, h } = frame
    describe(`${name} ${w}×${h} at ${fx},${fy}`, () => {
      it.each(US_IDS)('keeps the whole lower 48 inside the frame for %s', (id) => {
        const view = targetView(id, frame)
        for (const point of US_OUTLINE) {
          const [x, y] = projectWith(view, point)
          expect(x).toBeGreaterThanOrEqual(fx)
          expect(x).toBeLessThanOrEqual(fx + w)
          expect(y).toBeGreaterThanOrEqual(fy)
          expect(y).toBeLessThanOrEqual(fy + h)
        }
      })

      it.each(US_IDS)('turns towards %s', (id) => {
        const { lat, lng } = LOCATIONS[id]
        const race: LngLat = [lng, lat]
        const center = centerOf(usView(race, frame).rotation)
        const d = geoDistance(US_CENTER, race)
        expect(geoDistance(center, race)).toBeLessThan(d)
        const degrees = (d * 180) / Math.PI
        const turned = (geoDistance(US_CENTER, center) * 180) / Math.PI
        expect(turned).toBeCloseTo(Math.min(degrees, US_NUDGE * Math.sqrt(degrees)), 3)
      })

      it('zooms in past the globe', () => {
        expect(targetView('chicago', frame).scale).toBeGreaterThan(globeView(null, frame).scale * 1.5)
      })

      it('centres the globe in the frame', () => {
        expect(globeView([98.99, 18.79], frame).translate).toEqual([fx + w / 2, fy + h / 2])
      })
    })
  }

  it('keeps zoom and position between US races', () => {
    const boston = targetView('boston', DESKTOP)
    const eugene = targetView('eugene', DESKTOP)
    expect(boston.scale).toEqual(eugene.scale)
    expect(boston.translate).toEqual(eugene.translate)
    expect(boston.rotation).not.toEqual(eugene.rotation)
  })
})

describe('targetView', () => {
  it('shows the whole globe for races abroad', () => {
    expect(targetView('chiang-mai', DESKTOP)).toEqual(globeView([98.99, 18.79], DESKTOP))
  })

  it('shows the whole globe with nothing active', () => {
    expect(targetView(null, DESKTOP)).toEqual(globeView(null, DESKTOP))
  })
})

describe('interpolateView', () => {
  it('starts at from and ends at to', () => {
    const from = targetView('chiang-mai', DESKTOP)
    const to = targetView('boston', DESKTOP)
    const interpolate = interpolateView(from, to)
    for (const [t, view] of [
      [0, from],
      [1, to],
    ] as const) {
      const actual = interpolate(t)
      expect(actual.rotation[0]).toBeCloseTo(view.rotation[0])
      expect(actual.rotation[1]).toBeCloseTo(view.rotation[1])
      expect(actual.scale).toBeCloseTo(view.scale)
      expect(actual.translate[0]).toBeCloseTo(view.translate[0])
      expect(actual.translate[1]).toBeCloseTo(view.translate[1])
    }
  })
})

describe('viewDuration', () => {
  it('gives pans and zooms time to read', () => {
    expect(viewDuration(targetView('boston', DESKTOP), targetView('eugene', DESKTOP))).toBeGreaterThanOrEqual(500)
    expect(viewDuration(targetView(null, DESKTOP), targetView('fargo', DESKTOP))).toBeGreaterThanOrEqual(800)
  })
})
