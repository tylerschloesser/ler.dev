import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import { getAccelerationMap } from './apply-torque.js'
import { TWO_PI } from './const.js'
import { tempGetGear, tempSetGear } from './temp.js'
import {
  BuildHand,
  ConnectionType,
  Entity,
  EntityType,
  GearEntity,
  HandType,
  IAppContext,
  SimpleVec2,
} from './types.js'
import {
  getAdjacentConnections,
  iterateGearTiles,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

function newBuildGear(
  context: IAppContext,
  radius: number,
): GearEntity {
  const center: SimpleVec2 = {
    x: Math.round(context.camera.position.x),
    y: Math.round(context.camera.position.y),
  }
  const position: SimpleVec2 = {
    x: center.x - radius,
    y: center.y - radius,
  }
  return {
    id: `${position.x}.${position.y}`,
    type: EntityType.enum.Gear,
    position,
    center,
    angle: 0,
    connections: [],
    mass: Math.PI * radius ** 2,
    radius,
    velocity: 0,
  }
}

export function initBuild(
  context: IAppContext,
  radius: number,
  onChangeValid: BuildHand['onChangeValid'],
): void {
  invariant(context.hand === null)

  const gear = newBuildGear(context, radius)

  context.hand = {
    type: HandType.Build,
    chain: null,
    valid: false,
    onChangeValid,
    entities: {
      [gear.id]: gear,
    },
  }
  updateBuild(context, context.hand)
}

export function updateRadius(
  context: IAppContext,
  radius: number,
): void {
  invariant(context.hand?.type === HandType.Build)
  tempSetGear(context.hand, newBuildGear(context, radius))
  updateBuild(context, context.hand)
}

export function updateBuildPosition(
  context: IAppContext,
  hand: BuildHand,
): void {
  const gear = tempGetGear(hand)
  const x = Math.round(context.camera.position.x)
  const y = Math.round(context.camera.position.y)
  if (gear.center.x === x && gear.center.y === y) {
    return
  } else {
    gear.position.x = x - gear.radius
    gear.position.y = y - gear.radius
    gear.id = `${gear.position.x}.${gear.position.y}`
    gear.center.x = x
    gear.center.y = y
    updateBuild(context, hand)
  }
}

export function executeBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  if (!hand.valid) {
    return
  }

  const handGear = tempGetGear(hand)

  const { center: position } = handGear
  const tileId = `${position.x}.${position.y}`
  const tile = context.world.tiles[tileId]

  let gear: Entity | undefined
  if (tile?.entityId) {
    gear = context.world.entities[tile.entityId]
  }
  invariant(!gear || gear?.type === EntityType.enum.Gear)

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
    addGear(handGear, gear ?? null, context)
    hand.chain = null
  }

  tempSetGear(hand, newBuildGear(context, handGear.radius))
  updateBuild(context, hand)
}

export function updateBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  let valid = true
  let attach: GearEntity | undefined
  let chain: GearEntity | undefined

  const handGear = tempGetGear(hand)

  for (const tile of iterateGearTiles(
    handGear.center,
    handGear.radius,
    context.world,
  )) {
    if (!tile.entityId) {
      continue
    }
    const entity = context.world.entities[tile.entityId]
    invariant(entity)
    if (entity.type !== EntityType.enum.Gear) {
      valid = false
      break
    }
  }

  if (valid) {
    for (const gear of iterateOverlappingGears(
      handGear.center,
      handGear.radius,
      context.world,
    )) {
      if (
        handGear.radius === 1 &&
        Vec2.equal(gear.center, handGear.center)
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
    const dx = handGear.center.x - hand.chain.center.x
    const dy = handGear.center.y - hand.chain.center.y
    valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) >
        handGear.radius + hand.chain.radius
  }

  handGear.connections = []

  invariant(!(attach && chain))

  if (valid) {
    handGear.connections.push(
      ...getAdjacentConnections(
        handGear.center,
        handGear.radius,
        context.world,
      ),
    )
    if (hand.chain) {
      handGear.connections.push({
        type: ConnectionType.enum.Chain,
        entityId: hand.chain.id,
        multiplier: 1,
      })
    }
    if (chain) {
      handGear.connections.push({
        type: ConnectionType.enum.Chain,
        entityId: chain.id,
        multiplier: 1,
      })
    }
    if (attach) {
      handGear.connections.push({
        type: ConnectionType.enum.Attach,
        entityId: attach.id,
        multiplier: 1,
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
      getAccelerationMap(
        handGear,
        1,
        context.world.entities,
      ) !== null
  }

  if (hand.valid !== valid) {
    hand.valid = valid
    hand.onChangeValid?.(valid)
  }

  updateBuildGearAngle(context, hand)
}

// TODO move this to tick. set gear velocity and
// accelerate like a normal gear to remove redundancy
//
export function updateBuildGearAngle(
  context: IAppContext,
  hand: BuildHand,
): void {
  const gear = tempGetGear(hand)

  let connection = gear.connections.at(0)

  if (hand.valid && hand.chain) {
    // prioritize setting angle based on the chain
    // because chain gears require identical angles
    connection = gear.connections.find(
      (c) =>
        c.type !== ConnectionType.enum.Belt &&
        c.entityId === hand.chain?.id,
    )
    invariant(connection)
  }

  if (hand.valid && connection) {
    invariant(
      connection.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )

    // if valid, we can check any connected gear to get the angle
    const neighbor =
      context.world.entities[connection.entityId]
    invariant(neighbor?.type === EntityType.enum.Gear)

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
