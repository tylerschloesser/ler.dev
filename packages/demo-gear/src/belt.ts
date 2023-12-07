import invariant from 'tiny-invariant'
import { getForceMultiplierMap } from './apply-torque.js'
import {
  AddBeltHand,
  AdjacentConnection,
  BeltConnection,
  BeltDirection,
  BeltEntity,
  BeltIntersectionEntity,
  BeltPath,
  Connection,
  ConnectionType,
  EntityId,
  EntityType,
  GearEntity,
  IAppContext,
  World,
} from './types.js'
import { mod } from './util.js'

export function addBelts(
  world: World,
  belts: AddBeltHand['belts'],
): void {
  for (const belt of belts) {
    const path =
      belt.type === EntityType.enum.Belt
        ? belt.path
        : [belt.position]
    const first = path.at(0)
    invariant(first)

    const beltId = `belt.${first.x}.${first.y}`
    invariant(world.entities[beltId] === undefined)
    world.entities[beltId] = belt
    for (const position of path) {
      const { x, y } = position
      const tileId = `${x}.${y}`
      let tile = world.tiles[tileId]
      if (!tile) {
        tile = world.tiles[tileId] = {}
      }
      invariant(tile.beltId === undefined)
      tile.beltId = beltId
    }
  }
}

export function getBeltConnections(
  world: World,
  path: BeltPath,
  direction: BeltDirection,
): Connection[] {
  const connections: Connection[] = []

  for (const position of path) {
    let check
    switch (direction) {
      case 'x':
        check = [
          {
            // where is the tile we're going to check
            // relative to the cell position
            dc: { x: 0, y: -1 },

            // how to scale the gear radius when finding
            // the connection point
            sr: { x: 0, y: 1 },

            // how to adjust the gear position when
            // finding the connection point
            dg: { x: 0, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 1, y: -1 },
            sr: { x: 0, y: 1 },
            dg: { x: -1, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 0, y: 1 },
            sr: { x: 0, y: -1 },
            dg: { x: 0, y: -1 },
            multiplier: 1,
          },
          {
            dc: { x: 1, y: 1 },
            sr: { x: 0, y: -1 },
            dg: { x: -1, y: -1 },
            multiplier: 1,
          },
        ]
        break
      case 'y':
        check = [
          {
            dc: { x: -1, y: -1 },
            sr: { x: 1, y: 0 },
            dg: { x: 0, y: 0 },
            multiplier: 1,
          },
          {
            dc: { x: -1, y: 0 },
            sr: { x: 1, y: 0 },
            dg: { x: 0, y: -1 },
            multiplier: 1,
          },
          {
            dc: { x: 1, y: -1 },
            sr: { x: -1, y: 0 },
            dg: { x: -1, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 1, y: 0 },
            sr: { x: -1, y: 0 },
            dg: { x: -1, y: -1 },
            multiplier: -1,
          },
        ]
        break
      default:
        invariant(false)
    }

    const cx = position.x
    const cy = position.y

    for (const { dc, sr, dg, multiplier } of check) {
      const tx = cx + dc.x
      const ty = cy + dc.y
      const tileId = `${tx}.${ty}`

      const tile = world.tiles[tileId]

      if (!tile?.entityId) {
        continue
      }
      invariant(!tile.beltId)

      const gear = world.entities[tile.entityId]
      invariant(gear?.type === EntityType.enum.Gear)

      const gx = gear.center.x + dg.x + gear.radius * sr.x
      const gy = gear.center.y + dg.y + gear.radius * sr.y

      if (gx === cx && gy === cy) {
        if (
          // hacky way to check duplicates,
          // which happen because most points are checked twice
          // (both belt corners)
          !connections.find(
            (c) =>
              c.type === ConnectionType.enum.Adjacent &&
              c.entityId === gear.id &&
              c.multiplier === multiplier,
          )
        ) {
          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: gear.id,
            multiplier,
          })
        }
      }
    }
  }

  return connections
}

export function updateAddBeltProgress(
  context: IAppContext,
  hand: AddBeltHand,
  elapsed: number,
): void {
  if (
    !hand.valid ||
    hand.belts.length === 0 ||
    !hand.motion
  ) {
    return
  }

  const {
    motion: { source, forceMultiplierMap },
  } = hand

  source.belt.offset = mod(
    source.belt.offset +
      source.gear.velocity *
        source.gear.radius *
        elapsed *
        source.connection.multiplier,
    1,
  )
}

// belt.offset = mod(
//   belt.offset +
//     gear.velocity *
//       gear.radius *
//       elapsed *
//       adjacent.multiplier,
//   1,
// )
