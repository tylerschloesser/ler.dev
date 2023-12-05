import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  BeltPath,
  Connection,
  ConnectionType,
  IAppContext,
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
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ]
        break
      case 'y':
        check = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ]
        break
      default:
        invariant(false)
    }

    for (const { dx, dy } of check) {
      // prettier-ignore
      const tileId = `${cell.position.x + dx}.${cell.position.y + dy}`
      const tile = world.tiles[tileId]

      if (!tile?.gearId) {
        continue
      }
      invariant(!tile.beltId)

      const gear = world.gears[tile.gearId]
      invariant(gear)

      if (
        gear.position.x + -dx * gear.radius ===
          cell.position.x &&
        gear.position.y + -dy * gear.radius ===
          cell.position.y
      ) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          gearId: gear.id,
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

    hand.offset = gear.angle * gear.radius
  } else {
    hand.offset = 0
  }
}
