import invariant from 'tiny-invariant'
import {
  ApplyForceHand,
  AppState,
  Gear,
  HandType,
  PointerListenerFn,
} from './types.js'

const handlePointer: PointerListenerFn = (
  state,
  e,
  position,
) => {
  const { hand } = state
  invariant(hand?.type === HandType.ApplyForce)
  switch (e.type) {
    case 'pointerup': {
      updateApplyForce(state, hand, false)
      break
    }
    case 'pointerdown': {
      updateApplyForce(state, hand, true)
      break
    }
    case 'pointermove': {
      const tileX = Math.floor(position.x)
      const tileY = Math.floor(position.y)
      if (
        hand.position?.x === tileX &&
        hand.position?.y === tileY
      ) {
        break
      }
      updateApplyForcePosition(state, hand, tileX, tileY)
      break
    }
    case 'pointerleave': {
      hand.position = null
      break
    }
  }
}

export function initApplyForce(
  state: AppState,
  direction: 'cw' | 'ccw',
): void {
  state.hand = {
    type: HandType.ApplyForce,
    active: false,
    direction,
    gear: null,
    position: null,
  }
  state.pointerListeners.clear()
  state.pointerListeners.add(handlePointer)
}

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
