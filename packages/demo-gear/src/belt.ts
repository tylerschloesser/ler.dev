import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  AdjacentConnection,
  BeltDirection,
  BeltPath,
  Connection,
  ConnectionType,
  EntityType,
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
  for (const belt of hand.belts) {
    if (belt.type === EntityType.enum.BeltIntersection) {
      continue
    }
    if (hand.valid && belt.connections.length > 0) {
      const adjacent = belt.connections.find(
        (c): c is AdjacentConnection =>
          c.type === ConnectionType.enum.Adjacent,
      )
      if (!adjacent) {
        continue
      }

      const gear = context.world.entities[adjacent.entityId]
      invariant(gear?.type === EntityType.enum.Gear)

      belt.offset = mod(
        belt.offset +
          gear.velocity *
            gear.radius *
            elapsed *
            adjacent.multiplier,
        1,
      )
    } else {
      belt.offset = 0
    }
  }
}
