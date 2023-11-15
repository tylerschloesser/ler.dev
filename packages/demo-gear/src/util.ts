import invariant from 'tiny-invariant'
import {
  ConnectionType,
  Gear,
  GearId,
  Network,
  Vec2,
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

export function* iterateNetwork(
  root: Gear,
  gears: Record<GearId, Gear>,
) {
  const seen = new Set<Gear>()
  const stack = new Array<{ gear: Gear; sign: number }>({
    gear: root,
    sign: Math.sign(root.velocity),
  })

  while (stack.length) {
    const node = stack.pop()
    invariant(node)
    if (seen.has(node.gear)) {
      continue
    }
    seen.add(node.gear)

    yield node

    const { connections } = node.gear
    connections.forEach((connection) => {
      const neighbor = gears[connection.gearId]
      invariant(neighbor)
      stack.push({
        gear: neighbor,
        sign:
          node.sign *
          (connection.type === ConnectionType.Chain
            ? 1
            : -1),
      })
    })
  }
}

export function* iterateGearTileIds(
  position: Vec2,
  size: number,
) {
  const radius = (size - 1) / 2
  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))
      const tileId = `${position.x + x}.${position.y + y}`
      yield tileId
    }
  }
}

export function* iterateGearTiles(
  position: Vec2,
  size: number,
  world: World,
) {
  for (const tileId of iterateGearTileIds(position, size)) {
    const tile = world.tiles[tileId]
    if (tile) {
      yield tile
    }
  }
}

export function getNetwork(
  root: Gear,
  gears: Record<GearId, Gear>,
): Network {
  const network = new Set<Gear>()

  const stack = new Array<Gear>(root)
  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)
    if (network.has(gear)) {
      continue
    }

    network.add(gear)

    for (const connection of gear.connections) {
      const neighbor = gears[connection.gearId]
      invariant(neighbor)
      stack.push(neighbor)
    }
  }

  return network
}

export function getNetworks(
  gears: Record<GearId, Gear>,
): Network[] {
  const networks = new Array<Network>()

  const seen = new Set<Gear>()
  for (const root of Object.values(gears)) {
    if (seen.has(root)) {
      continue
    }
    const network = getNetwork(root, gears)
    network.forEach((node) => seen.add(node))
    networks.push(network)
  }

  return networks
}

export function getEnergy(
  root: Gear,
  world: World,
): number {
  let energy = 0
  const stack = new Array<Gear>(root)
  const seen = new Set<Gear>()

  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)
    if (seen.has(gear)) {
      continue
    }
    seen.add(gear)

    energy +=
      (1 / 4) *
      gear.radius ** 2 *
      gear.velocity ** 2 *
      gear.mass

    for (const connection of gear.connections) {
      const peer = world.gears[connection.gearId]
      invariant(peer)
      stack.push(peer)
    }
  }

  return energy
}
