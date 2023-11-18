import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import { AppState, BuildPointer, Gear } from './types.js'
import {
  getAdjacentConnections,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

export function buildPointerMove(
  state: AppState,
  pointer: BuildPointer,
): void {
  updatePointer(state, pointer)
}

export function buildPointerUp(
  state: AppState,
  pointer: BuildPointer,
): void {
  invariant(pointer.position)
  updatePointer(state, pointer)
  if (pointer.valid) {
    return
  }

  const tileId = `${pointer.position.x}.${pointer.position.y}`
  const tile = state.world.tiles[tileId]

  let gear: Gear | undefined
  if (tile && !pointer.attach) {
    if (tile.attachedGearId) {
      gear = state.world.gears[tile.attachedGearId]
    } else {
      gear = state.world.gears[tile.gearId]
    }
    invariant(gear)
    invariant(gear.radius === 1)
    invariant(pointer.radius === 1)

    if (pointer.chain) {
      invariant(gear !== pointer.chain)
      addChainConnection(gear, pointer.chain, state)
    } else {
      pointer.chain = gear
    }
  } else {
    addGear(
      pointer.position,
      pointer.radius,
      pointer.chain,
      pointer.attach,
      pointer.connections,
      state,
    )
  }

  updatePointer(state, pointer)
}

function updatePointer(
  state: AppState,
  pointer: BuildPointer,
): void {
  invariant(pointer.position)
  pointer.valid = true

  for (const gear of iterateOverlappingGears(
    pointer.position,
    pointer.radius,
    state.world,
  )) {
    if (
      !(
        pointer.radius === 1 &&
        Vec2.equal(gear.position, pointer.position)
      )
    ) {
      pointer.valid = false
      break
    }
  }

  if (pointer.valid && pointer.chain) {
    const { chain } = pointer
    const dx = pointer.position.x - chain.position.x
    const dy = pointer.position.y - chain.position.y
    pointer.valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      dx + dy > pointer.radius + chain.radius
  }

  if (pointer.valid) {
    pointer.connections = getAdjacentConnections(
      pointer.position,
      pointer.radius,
      state.world,
    )
  } else {
    pointer.connections = []
  }
}

export function buildPointerDown(
  state: AppState,
  pointer: BuildPointer,
): void {}
