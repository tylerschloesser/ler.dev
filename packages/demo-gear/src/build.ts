import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import { AppState, Gear } from './types.js'
import {
  getAdjacentConnections,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

export function updateBuildPosition(
  state: AppState,
  x: number,
  y: number,
): void {
  invariant(state.build)
  if (
    state.build.position?.x === x &&
    state.build.position.y === y
  ) {
    return
  }
  if (!state.build.position) {
    state.build.position = { x, y }
  } else {
    state.build.position.x = x
    state.build.position.y = y
  }
  updateBuild(state)
}

export function executeBuild(state: AppState): void {
  const { build } = state
  invariant(build?.position)
  if (!build.valid) {
    return
  }

  const tileId = `${build.position.x}.${build.position.y}`
  const tile = state.world.tiles[tileId]

  let gear: Gear | undefined
  if (tile?.attachedGearId) {
    gear = state.world.gears[tile.attachedGearId]
  } else if (tile?.gearId) {
    gear = state.world.gears[tile.gearId]
  }

  if (gear?.radius === 1) {
    if (build.chain) {
      invariant(gear !== build.chain)
      addChainConnection(gear, build.chain, state)
    } else {
      build.chain = gear
    }
  } else {
    addGear(
      build.position,
      build.radius,
      build.chain,
      gear ?? null,
      build.connections,
      state,
    )
    build.chain = null
  }
  updateBuild(state)
}

function updateBuild(state: AppState): void {
  const { build } = state
  invariant(build?.position)
  build.valid = true
  for (const gear of iterateOverlappingGears(
    build.position,
    build.radius,
    state.world,
  )) {
    if (
      !(
        build.radius === 1 &&
        Vec2.equal(gear.position, build.position)
      )
    ) {
      build.valid = false
      break
    }
  }

  if (build.valid && build.chain) {
    const { chain } = build
    const dx = build.position.x - chain.position.x
    const dy = build.position.y - chain.position.y
    build.valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) > build.radius + chain.radius
  }

  if (build.valid) {
    build.connections = getAdjacentConnections(
      build.position,
      build.radius,
      state.world,
    )
  } else {
    build.connections = []
  }
}
