import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import {
  AppState,
  BuildHand,
  ConnectionType,
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
    angle: 0, // TODO
    velocity: 0, // TODO
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

export function updateBuild(
  state: AppState,
  hand: BuildHand,
): void {
  invariant(hand?.position)
  let valid = true
  let attach: Gear | undefined
  let chain: Gear | undefined
  for (const gear of iterateOverlappingGears(
    hand.position,
    hand.radius,
    state.world,
  )) {
    if (
      hand.radius === 1 &&
      Vec2.equal(gear.position, hand.position)
    ) {
      if (gear.radius === 1) {
        chain = gear
      } else {
        //
        // assume we're attaching, because we would've
        // already seen the attached gear in a previous
        // iteration
        //
        attach = gear
      }
    } else {
      valid = false
    }

    // only need to look at one gear
    break
  }

  if (valid && hand.chain) {
    const dx = hand.position.x - hand.chain.position.x
    const dy = hand.position.y - hand.chain.position.y
    valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) > hand.radius + hand.chain.radius
  }

  hand.connections = []

  if (valid) {
    // TODO not super graceful, but the order of connections
    // matters here...
    //
    // Chain connections must be first, so that they're rendered
    // with the correct angles...
    //
    // Additionally, the "source" chain takes precendence over
    // that "target" chain, when applicable, for the same reason.
    //
    if (hand.chain) {
      hand.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: hand.chain.id,
      })
    }
    if (chain) {
      hand.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: chain.id,
      })
    }
    if (attach) {
      hand.connections.push({
        type: ConnectionType.enum.Attach,
        gearId: attach.id,
      })
    }
    hand.connections.push(
      ...getAdjacentConnections(
        hand.position,
        hand.radius,
        state.world,
      ),
    )
  }

  if (hand.connections.length > 0) {
    // TODO handle more than one connection

    const connection = hand.connections.at(0)
    invariant(connection)
    const peer = state.world.gears[connection.gearId]
    invariant(peer)

    // TODO this is duplicated in init-simulator
    let n
    switch (connection.type) {
      case ConnectionType.enum.Adjacent:
        n = (peer.radius / hand.radius) * -1
        break
      case ConnectionType.enum.Chain:
        n = peer.radius / hand.radius
        break
      case ConnectionType.enum.Attach:
        n = 1
    }

    hand.angle = peer.angle * n
    hand.velocity = peer.velocity * n
  } else {
    hand.angle = 0
    hand.velocity = 0
  }

  if (hand.valid !== valid) {
    hand.valid = valid
    hand.onChangeValid?.(valid)
  }
}
