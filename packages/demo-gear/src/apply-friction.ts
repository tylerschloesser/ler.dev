import invariant from 'tiny-invariant'
import {
  ApplyFrictionHand,
  AppState,
  Gear,
} from './types.js'

export function updateApplyFrictionPosition(
  state: AppState,
  hand: ApplyFrictionHand,
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

export function updateApplyFriction(
  _state: AppState,
  hand: ApplyFrictionHand,
  active: boolean,
): void {
  hand.active = active
}
