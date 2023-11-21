import invariant from 'tiny-invariant'
import {
  AccelerateHand,
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
  invariant(hand?.type === HandType.Accelerate)
  switch (e.type) {
    case 'pointerup': {
      updateAccelerate(state, hand, false)
      break
    }
    case 'pointerdown': {
      updateAccelerate(state, hand, true)
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
      updateAcceleratePosition(state, hand, tileX, tileY)
      break
    }
    case 'pointerleave': {
      hand.position = null
      break
    }
  }
}

export function initAccelerate(
  state: AppState,
  direction: number,
): void {
  state.hand = {
    type: HandType.Accelerate,
    active: false,
    direction,
    gear: null,
    position: null,
  }
  state.pointerListeners.clear()
  state.pointerListeners.add(handlePointer)
}

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

export function updateAccelerate(
  _state: AppState,
  hand: AccelerateHand,
  active: boolean,
): void {
  hand.active = active
}
