import invariant from 'tiny-invariant'
import { AppState } from './types.js'

export function updateAcceleratePosition(
  state: AppState,
  x: number,
  y: number,
): void {
  const { accelerate } = state
  invariant(accelerate)

  if (
    accelerate.position?.x === x &&
    accelerate.position.y === y
  ) {
    return
  } else if (accelerate.position) {
    accelerate.position.x = x
    accelerate.position.y = y
  } else {
    accelerate.position = { x, y }
  }

  accelerate.gear = null

  const tileId = `${accelerate.position.x}.${accelerate.position.y}`
  const tile = state.world.tiles[tileId]
  if (!tile) {
    return
  }
  const gear = state.world.gears[tile.gearId]
  invariant(gear)
  accelerate.gear = gear
}

export function updateAccelerate(state: AppState): void {
  const { accelerate } = state
  invariant(accelerate)
  accelerate.active = state.pointer.down
}
