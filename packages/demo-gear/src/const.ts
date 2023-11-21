const MIN_RADIUS = 1
const MAX_RADIUS = 5

export const GEAR_RADIUSES = (() => {
  const arr = new Array(MAX_RADIUS - MIN_RADIUS)
  for (let i = MIN_RADIUS; i <= MAX_RADIUS; i++) {
    arr.push(i)
  }
  return arr
})()

export const TICK_DURATION = 16
export const DRAW_GEAR_BOX = false

export const FRICTION = 0 // energy/sec
export const ACCELERATION = 2

export const TEETH = 12

export const PI = Math.PI
export const TWO_PI = Math.PI * 2
export const HALF_PI = Math.PI / 2

export const MIN_ZOOM = 0
export const MAX_ZOOM = 1

export const MIN_TILE_SIZE_FACTOR = 1 / 256
export const MAX_TILE_SIZE_FACTOR = 1 / 8
