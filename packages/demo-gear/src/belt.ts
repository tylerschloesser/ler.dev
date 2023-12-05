import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  BeltPath,
  Connection,
  ConnectionType,
  IAppContext,
  TileId,
  World,
} from './types.js'

export function addBelt(
  world: World,
  path: BeltPath,
): void {
  const { belts, tiles } = world
  const first = path.at(0)
  invariant(first)

  const beltId = `belt.${first.position.x}.${first.position.y}`
  invariant(belts[beltId] === undefined)
  belts[beltId] = {
    id: beltId,
    path,
    connections: [],
    velocity: 0,
    offset: 0,
  }
  for (const cell of path) {
    const { x, y } = cell.position
    const tileId = `${x}.${y}`
    let tile = tiles[tileId]
    if (!tile) {
      tile = tiles[tileId] = {}
    }
    invariant(tile.beltId === undefined)
    tile.beltId = beltId
  }
}

export function getBeltPathConnections(
  world: World,
  path: BeltPath,
): Connection[] {
  const connections: Connection[] = []

  for (const cell of path) {
    let check
    switch (cell.direction) {
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

    const cx = cell.position.x
    const cy = cell.position.y

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
  if (hand.valid && hand.connections.length > 0) {
    const connection = hand.connections.at(0)
    invariant(
      connection?.type === ConnectionType.enum.Adjacent,
    )

    const gear = context.world.gears[connection.gearId]
    invariant(gear)

    hand.offset =
      (((gear.angle * gear.radius * connection.multiplier) %
        1) +
        1) %
      1
  } else {
    hand.offset = 0
  }
}
