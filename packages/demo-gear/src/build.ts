import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import { getForceMultiplierMap } from './apply-torque.js'
import { TWO_PI } from './const.js'
import {
  BuildHand,
  ConnectionType,
  Gear,
  HandType,
  IAppContext,
} from './types.js'
import {
  getAdjacentConnections,
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
      center: {
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
    hand.gear.center.x === x &&
    hand.gear.center.y === y
  ) {
    return
  } else {
    hand.gear.center.x = x
    hand.gear.center.y = y
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

  const { center: position } = hand.gear
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

      if (gear.velocity === 0) {
        gear.angle = hand.chain.angle
      } else if (hand.chain.velocity === 0) {
        hand.chain.angle = gear.angle
      } else {
        // Doesn't work at the moment because need to propogate
        // chain angle
        invariant(
          false,
          'TODO allow two spinning gears to be connected by chain',
        )
      }

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

  console.log(context)
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
    hand.gear.center,
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
      hand.gear.center,
      hand.gear.radius,
      context.world,
    )) {
      if (
        hand.gear.radius === 1 &&
        Vec2.equal(gear.center, hand.gear.center)
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
    const dx = hand.gear.center.x - hand.chain.center.x
    const dy = hand.gear.center.y - hand.chain.center.y
    valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) >
        hand.gear.radius + hand.chain.radius
  }

  hand.gear.connections = []

  invariant(!(attach && chain))

  if (valid) {
    hand.gear.connections.push(
      ...getAdjacentConnections(
        hand.gear.center,
        hand.gear.radius,
        context.world,
      ),
    )
    if (hand.chain) {
      hand.gear.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: hand.chain.id,
        multiplier: 1,
      })
    }
    if (chain) {
      hand.gear.connections.push({
        type: ConnectionType.enum.Chain,
        gearId: chain.id,
        multiplier: 1,
      })
    }
    if (attach) {
      hand.gear.connections.push({
        type: ConnectionType.enum.Attach,
        gearId: attach.id,
        multiplier: (attach.radius / hand.gear.radius) ** 2,
      })
    }
  }

  if (valid) {
    // Check the torque multiplier function to ensure
    // gear ratios are valid.
    //
    // This works even though there are no connections from the
    // existing gears to the root gear because we still
    // iterate through all root gear connections.
    //
    valid =
      getForceMultiplierMap(hand.gear, context.world) !==
      null
  }

  if (hand.valid !== valid) {
    hand.valid = valid
    hand.onChangeValid?.(valid)
  }

  updateBuildGearAngle(context, hand)
}

export function updateBuildGearAngle(
  context: IAppContext,
  hand: BuildHand,
): void {
  const { gear } = hand

  let connection = gear.connections.at(0)

  if (hand.valid && hand.chain) {
    // prioritize setting angle based on the chain
    // because chain gears require identical angles
    connection = gear.connections.find(
      (c) =>
        c.type !== ConnectionType.enum.Belt &&
        c.gearId === hand.chain?.id,
    )
    invariant(connection)
  }

  if (hand.valid && connection) {
    invariant(
      connection.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )

    // if valid, we can check any connected gear to get the angle
    const neighbor = context.world.gears[connection.gearId]
    invariant(neighbor)

    switch (connection.type) {
      case ConnectionType.enum.Attach:
      case ConnectionType.enum.Chain:
        gear.angle = neighbor.angle
        break
      case ConnectionType.enum.Adjacent:
        gear.angle =
          (TWO_PI - neighbor.angle) *
          (neighbor.radius / gear.radius)
        break
    }
  } else {
    gear.angle = 0
  }
}
