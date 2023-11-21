import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import {
  AppState,
  BuildHand,
  Gear,
  HandType,
  PointerListenerFn,
} from './types.js'
import {
  getAdjacentConnections,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

const handlePointer: PointerListenerFn = (
  state,
  e,
  position,
) => {
  const { hand } = state
  invariant(hand?.type === HandType.Build)
  switch (e.type) {
    case 'pointermove': {
      const tileX = Math.floor(position.x + 0.5)
      const tileY = Math.floor(position.y + 0.5)
      if (
        hand.position?.x === tileX &&
        hand.position?.y === tileY
      ) {
        break
      }
      updateBuildPosition(state, hand, tileX, tileY)
      break
    }
    case 'pointerup': {
      executeBuild(state, hand)
      break
    }
    case 'pointerleave': {
      hand.position = null
      break
    }
  }
}

export function initBuild(
  state: AppState,
  radius: number,
): void {
  state.hand = {
    type: HandType.Build,
    chain: null,
    connections: [],
    position: null,
    radius,
    valid: false,
  }
  state.pointerListeners.clear()
  state.pointerListeners.add(handlePointer)
}

export function updateBuildPosition(
  state: AppState,
  hand: BuildHand,
  x: number,
  y: number,
): void {
  if (hand.position?.x === x && hand.position.y === y) {
    return
  }
  if (!hand.position) {
    hand.position = { x, y }
  } else {
    hand.position.x = x
    hand.position.y = y
  }
  updateBuild(state, hand)
}

export function executeBuild(
  state: AppState,
  hand: BuildHand,
): void {
  invariant(hand.position)
  if (!hand.valid) {
    return
  }

  const tileId = `${hand.position.x}.${hand.position.y}`
  const tile = state.world.tiles[tileId]

  let gear: Gear | undefined
  if (tile?.attachedGearId) {
    gear = state.world.gears[tile.attachedGearId]
  } else if (tile?.gearId) {
    gear = state.world.gears[tile.gearId]
  }

  if (gear?.radius === 1) {
    if (hand.chain) {
      invariant(gear !== hand.chain)
      addChainConnection(gear, hand.chain, state)
    } else {
      hand.chain = gear
    }
  } else {
    addGear(
      hand.position,
      hand.radius,
      hand.chain,
      gear ?? null,
      hand.connections,
      state,
    )
    hand.chain = null
  }
  updateBuild(state, hand)
}

function updateBuild(
  state: AppState,
  hand: BuildHand,
): void {
  invariant(hand?.position)
  hand.valid = true
  for (const gear of iterateOverlappingGears(
    hand.position,
    hand.radius,
    state.world,
  )) {
    if (
      !(
        hand.radius === 1 &&
        Vec2.equal(gear.position, hand.position)
      )
    ) {
      hand.valid = false
      break
    }
  }

  if (hand.valid && hand.chain) {
    const { chain } = hand
    const dx = hand.position.x - chain.position.x
    const dy = hand.position.y - chain.position.y
    hand.valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) > hand.radius + chain.radius
  }

  if (hand.valid) {
    hand.connections = getAdjacentConnections(
      hand.position,
      hand.radius,
      state.world,
    )
  } else {
    hand.connections = []
  }
}
