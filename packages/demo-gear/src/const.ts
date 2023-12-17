import invariant from 'tiny-invariant'
import { SimpleVec2 } from './types.js'

export const MIN_RADIUS: number = 1
export const MAX_RADIUS: number = 5

invariant(MAX_RADIUS > MIN_RADIUS)

export const GEAR_RADIUSES = (() => {
  const count = MAX_RADIUS - MIN_RADIUS + 1
  const arr = new Array<number>(count)
  for (let i = 0; i < count; i++) {
    arr[i] = MIN_RADIUS + i
  }
  return arr
})()

export const TICK_DURATION = 16
export const DRAW_GEAR_BOX = false

export const TEETH = 12

export const PI = Math.PI
export const TWO_PI = Math.PI * 2
export const HALF_PI = Math.PI / 2

export const MIN_ZOOM = 0
export const MAX_ZOOM = 1

export const MIN_TILE_SIZE_FACTOR = 1 / 256
export const MAX_TILE_SIZE_FACTOR = 1 / 8

export const BELT_ITEM_GAP = 0.25

export const BELT_SIZE: SimpleVec2 = {
  x: 1,
  y: 1,
}

export const GEAR_RADIUS_TO_SIZE = GEAR_RADIUSES.reduce<
  Record<number, SimpleVec2>
>(
  (acc, r) => ({
    ...acc,
    [r]: { x: r * 2, y: r * 2 },
  }),
  {},
)
