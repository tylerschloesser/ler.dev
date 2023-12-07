import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  AdjacentConnection,
  Belt,
  BeltDirection,
  BeltPath,
  BeltType,
  Connection,
  ConnectionType,
  IAppContext,
  World,
} from './types.js'
import { mod } from './util.js'

export function addBelts(
  world: World,
  belts: Belt[],
): void {
  for (const belt of belts) {
    const path =
      belt.type === BeltType.enum.Straight
        ? belt.path
        : [belt.position]
    const first = path.at(0)
    invariant(first)

    const beltId = `belt.${first.x}.${first.y}`
    invariant(world.belts[beltId] === undefined)
    world.belts[beltId] = belt
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

      const gear = world.gears[tile.entityId]
      invariant(gear)

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
    if (belt.type === BeltType.enum.Intersection) {
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

      const gear = context.world.gears[adjacent.entityId]
      invariant(gear)

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
