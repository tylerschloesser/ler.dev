import invariant from 'tiny-invariant'
import { AppState, ApplyForcePointer } from './types.js'

export function applyForcePointerMove(
  state: AppState,
  pointer: ApplyForcePointer,
): void {}

export function applyForcePointerUp(
  state: AppState,
  pointer: ApplyForcePointer,
): void {
  pointer.gear = null
}

export function applyForcePointerDown(
  state: AppState,
  pointer: ApplyForcePointer,
): void {
  invariant(pointer.position)
  const tileId = `${pointer.position.x}.${pointer.position.y}`
  const tile = state.world.tiles[tileId]
  if (!tile) {
    return
  }
  const gear = state.world.gears[tile.gearId]
  invariant(gear)
  pointer.gear = gear
}
