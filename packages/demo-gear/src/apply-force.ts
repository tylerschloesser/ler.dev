import invariant from 'tiny-invariant'
import { ApplyForceHand, AppState, Gear } from './types.js'

export function updateApplyForcePosition(
  state: AppState,
  hand: ApplyForceHand,
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

  const tileId = `${hand.position.x}.${hand.position.y}`
  const tile = state.world.tiles[tileId]

  let gear: Gear | null = null
  if (tile) {
    gear = state.world.gears[tile.gearId] ?? null
    invariant(gear)
  }

  if (hand.gear !== gear) {
    hand.onChangeGear?.(gear)
    hand.gear = gear
  }
}

export function updateApplyForce(
  _state: AppState,
  hand: ApplyForceHand,
  active: boolean,
): void {
  hand.active = active
}
