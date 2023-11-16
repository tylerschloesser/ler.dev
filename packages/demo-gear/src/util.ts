import invariant from 'tiny-invariant'
import {
  ConnectionType,
  Gear,
  GearId,
  SimpleVec2,
  World,
} from './types.js'

export function* iterateConnections(
  gears: Record<GearId, Gear>,
) {
  const seen = new Map<string, ConnectionType>()
  for (const gear of Object.values(gears)) {
    for (const connection of gear.connections) {
      const id = [gear.id, connection.gearId]
        .sort()
        .join('.')
      if (seen.has(id)) {
        // sanity check the connection type
        invariant(seen.get(id) === connection.type)
        continue
      }
      seen.set(id, connection.type)

      const peer = gears[connection.gearId]
      invariant(peer)

      yield {
        gear1: gear,
        gear2: peer,
        type: connection.type,
      }
    }
  }
}

export function* iterateNetwork(root: Gear, world: World) {
  const seen = new Set<Gear>()
  const stack = new Array<Gear>(root)

  while (stack.length) {
    const node = stack.pop()
    invariant(node)
    if (seen.has(node)) {
      continue
    }
    seen.add(node)

    yield node

    const { connections } = node
    connections.forEach((connection) => {
      const neighbor = world.gears[connection.gearId]
      invariant(neighbor)
      stack.push(neighbor)
    })
  }
}

export function* iterateGearTileIds(
  position: SimpleVec2,
  radius: number,
) {
  for (let x = -radius; x < radius; x++) {
    for (let y = -radius; y < radius; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))
      const tileId = `${position.x + x}.${position.y + y}`
      yield tileId
    }
  }
}

export function* iterateGearTiles(
  position: SimpleVec2,
  radius: number,
  world: World,
) {
  for (const tileId of iterateGearTileIds(
    position,
    radius,
  )) {
    const tile = world.tiles[tileId]
    if (tile) {
      yield tile
    }
  }
}
