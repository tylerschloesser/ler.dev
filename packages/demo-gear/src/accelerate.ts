import invariant from 'tiny-invariant'
import { AccelerateHand, AppState } from './types.js'

export function updateAcceleratePosition(
  state: AppState,
  hand: AccelerateHand,
  x: number,
  y: number,
): void {
  if (hand.position?.x === x && hand.position.y === y) {
    return
  } else if (hand.position) {
    hand.position.x = x
    hand.position.y = y
  } else {
    hand.position = { x, y }
  }

  hand.gear = null

  const tileId = `${hand.position.x}.${hand.position.y}`
  const tile = state.world.tiles[tileId]
  if (!tile) {
    return
  }
  const gear = state.world.gears[tile.gearId]
  invariant(gear)
  hand.gear = gear
}

export function updateAccelerate(
  state: AppState,
  hand: AccelerateHand,
): void {
  hand.active = state.pointer.down
}
