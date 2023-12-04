import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import {
  IAppContext,
  BuildHand,
  ConnectionType,
  Gear,
  HandType,
} from './types.js'
import {
  getAdjacentConnections,
  isNetworkValid,
  iterateGearTiles,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

export function initBuild(
  context: IAppContext,
  radius: number,
  onChangeValid: BuildHand['onChangeValid'],
): void {
  invariant(context.hand === null)
  context.hand = {
    type: HandType.Build,
    chain: null,
    gear: {
      radius,
      angle: 0,
      connections: [],
      position: {
        x: Number.NaN,
        y: Number.NaN,
      },
      velocity: 0,
    },
    valid: false,
    onChangeValid,
  }
  updateBuildPosition(context, context.hand)
}

export function updateRadius(
  context: IAppContext,
  radius: number,
): void {
  invariant(context.hand?.type === HandType.Build)
  context.hand.gear.radius = radius
  updateBuild(context, context.hand)
}

export function updateBuildPosition(
  context: IAppContext,
  hand: BuildHand,
): void {
  const x = Math.round(context.camera.position.x)
  const y = Math.round(context.camera.position.y)
  if (
    hand.gear.position.x === x &&
    hand.gear.position.y === y
  ) {
    return
  } else {
    hand.gear.position.x = x
    hand.gear.position.y = y
    updateBuild(context, hand)
  }
}

export function executeBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  invariant(hand.gear)
  if (!hand.valid) {
    return
  }

  const { position } = hand.gear
  const tileId = `${position.x}.${position.y}`
  const tile = context.world.tiles[tileId]

  let gear: Gear | undefined
  if (tile?.attachedGearId) {
    gear = context.world.gears[tile.attachedGearId]
  } else if (tile?.gearId) {
    gear = context.world.gears[tile.gearId]
  }

  if (gear?.radius === 1) {
    if (hand.chain) {
      invariant(gear !== hand.chain)
      addChainConnection(gear, hand.chain, context)
      hand.chain = null
    } else {
      hand.chain = gear
    }
  } else {
    addGear(hand.gear, hand.chain, gear ?? null, context)
    hand.chain = null
  }
  updateBuild(context, hand)
}

export function updateBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  invariant(hand.gear)

  let valid = true
  let attach: Gear | undefined
  let chain: Gear | undefined

  for (const tile of iterateGearTiles(
    hand.gear.position,
    hand.gear.radius,
    context.world,
  )) {
    if (tile.beltId) {
      valid = false
      break
    }
  }

  if (valid) {
    for (const gear of iterateOverlappingGears(
      hand.gear.position,
      hand.gear.radius,
      context.world,
    )) {
      if (
        hand.gear.radius === 1 &&
        Vec2.equal(gear.position, hand.gear.position)
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
  }

  if (valid && hand.chain) {
    const dx = hand.gear.position.x - hand.chain.position.x
    const dy = hand.gear.position.y - hand.chain.position.y
    valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) >
        hand.gear.radius + hand.chain.radius
  }

  hand.gear.connections = []

  invariant(!(attach && chain))

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
      hand.gear.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: hand.chain.id,
      })
    }
    if (chain) {
      hand.gear.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: chain.id,
      })
    }
    if (attach) {
      hand.gear.connections.push({
        type: ConnectionType.enum.Attach,
        gearId: attach.id,
      })
    }
    hand.gear.connections.push(
      ...getAdjacentConnections(
        hand.gear.position,
        hand.gear.radius,
        context.world,
      ),
    )
  }

  if (hand.gear.connections.length > 0) {
    // TODO handle more than one connection

    const connection = hand.gear.connections.at(0)
    invariant(connection)
    const peer = context.world.gears[connection.gearId]
    invariant(peer)

    // TODO this is duplicated in init-simulator
    let n
    switch (connection.type) {
      case ConnectionType.enum.Adjacent:
        n = (peer.radius / hand.gear.radius) * -1
        break
      case ConnectionType.enum.Chain:
        n = peer.radius / hand.gear.radius
        break
      case ConnectionType.enum.Attach:
        n = 1
    }

    hand.gear.angle = peer.angle * n
    hand.gear.velocity = peer.velocity * n
  }

  if (valid) {
    valid = isNetworkValid(hand.gear, context.world)
  }

  if (!valid) {
    hand.gear.angle = 0
    hand.gear.velocity = 0
  }

  if (hand.valid !== valid) {
    hand.valid = valid
    hand.onChangeValid?.(valid)
  }
}
