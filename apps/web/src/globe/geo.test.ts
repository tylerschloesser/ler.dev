import { describe, expect, it } from 'vitest'
import {
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
