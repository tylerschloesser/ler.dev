import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  Belt,
  BeltDirection,
  BeltPath,
  BeltType,
  Connection,
  ConnectionType,
  IAppContext,
  PartialBelt,
  World,
} from './types.js'

export function addBelts(
  world: World,
  belts: PartialBelt[],
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
    world.belts[beltId] = {
      id: beltId,
      velocity: 0,
      ...belt,
    }
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

      if (!tile?.gearId) {
        continue
      }
      invariant(!tile.beltId)

      const gear = world.gears[tile.gearId]
      invariant(gear)

      const gx = gear.position.x + dg.x + gear.radius * sr.x
      const gy = gear.position.y + dg.y + gear.radius * sr.y

      // TODO fix duplicates
      if (gx === cx && gy === cy) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          gearId: gear.id,
          multiplier,
        })
      }
    }
  }

  return connections
}

export function updateAddBeltProgress(
  context: IAppContext,
  hand: AddBeltHand,
): void {
  for (const belt of hand.belts) {
    if (hand.valid && belt.connections.length > 0) {
      const first = belt.connections.at(0)
      invariant(first)

      invariant(first.type === ConnectionType.enum.Adjacent)

      const gear = context.world.gears[first.gearId]
      invariant(gear)

      belt.offset =
        gear.angle * gear.radius * first.multiplier
    } else {
      belt.offset = 0
    }
  }
}
