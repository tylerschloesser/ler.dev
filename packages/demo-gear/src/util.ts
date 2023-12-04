import invariant from 'tiny-invariant'
import {
  MAX_TILE_SIZE_FACTOR,
  MAX_ZOOM,
  MIN_TILE_SIZE_FACTOR,
  MIN_ZOOM,
} from './const.js'
import {
  Connection,
  ConnectionType,
  Gear,
  GearId,
  PartialGear,
  SimpleVec2,
  World,
} from './types.js'

function getConnectionId(a: GearId, b: GearId) {
  return a < b ? `${a}.${b}` : `${b}.${a}`
}

export function* iterateConnections(
  gears: Record<GearId, Gear>,
) {
  const seen = new Map<string, ConnectionType>()
  for (const gear of Object.values(gears)) {
    for (const connection of gear.connections) {
      const id = getConnectionId(gear.id, connection.gearId)
      if (seen.has(id)) {
        // sanity check the connection type
        invariant(seen.get(id) === connection.type)
        continue
      }
      seen.set(id, connection.type)

      const peer = gears[connection.gearId]
      invariant(peer)

      // TODO cleanup GC
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

export function* iterateOverlappingGears(
  position: SimpleVec2,
  radius: number,
  world: World,
) {
  const seen = new Set<GearId>()

  for (const tile of iterateGearTiles(
    position,
    radius,
    world,
  )) {
    if (!tile.gearId) {
      continue
    }

    if (
      tile.attachedGearId &&
      !seen.has(tile.attachedGearId)
    ) {
      seen.add(tile.attachedGearId)
      const attachedGear = world.gears[tile.attachedGearId]
      invariant(attachedGear)
      yield attachedGear
    }

    if (!seen.has(tile.gearId)) {
      const gear = world.gears[tile.gearId]
      invariant(gear)
      yield gear
    }
    seen.add(tile.gearId)
  }
}

const DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

function* iterateAdjacentGears(
  position: SimpleVec2,
  radius: number,
  world: World,
) {
  for (const [dx, dy] of DELTAS) {
    invariant(dx !== undefined)
    invariant(dy !== undefined)
    const tileId =
      `${position.x + dx * (radius + 1)}` +
      `.${position.y + dy * (radius + 1)}`
    const tile = world.tiles[tileId]

    if (!tile?.gearId) {
      continue
    }

    const gear = world.gears[tile.gearId]
    invariant(gear)
    if (
      gear.position.x + (gear.radius + radius) * -dx ===
        position.x &&
      gear.position.y + (gear.radius + radius) * -dy ===
        position.y
    ) {
      yield gear
    }
  }
}

export function getAdjacentConnections(
  position: SimpleVec2,
  radius: number,
  world: World,
): Connection[] {
  const connections: Connection[] = []
  for (const gear of iterateAdjacentGears(
    position,
    radius,
    world,
  )) {
    connections.push({
      type: ConnectionType.enum.Adjacent,
      gearId: gear.id,
    })
  }
  return connections
}

export function clamp(
  v: number,
  min: number,
  max: number,
): number {
  return Math.min(max, Math.max(v, min))
}

export function clampZoom(zoom: number): number {
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}

export function clampTileSize(
  tileSize: number,
  vx: number,
  vy: number,
) {
  const minTileSize =
    Math.min(vx, vy) * MIN_TILE_SIZE_FACTOR
  const maxTileSize =
    Math.min(vx, vy) * MAX_TILE_SIZE_FACTOR
  return clamp(tileSize, minTileSize, maxTileSize)
}

export function dist(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

const cache = new Map()
export function throttle<A extends Array<unknown>>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timeout: number | undefined
  let use: A

  const cached = cache.get(fn)
  if (cached) {
    return cached
  }

  const throttled = (...args: A) => {
    use = args
    if (!timeout) {
      timeout = self.setTimeout(() => {
        fn(...use)
        timeout = undefined
      }, ms)
    }
  }

  cache.set(fn, throttled)
  return throttled
}

export function getTotalMass(
  root: Gear,
  world: World,
): number {
  const stack = new Array<Gear>(root)
  const seen = new Set<Gear>()

  let mass = 0

  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    if (seen.has(tail)) {
      continue
    }
    seen.add(tail)

    mass += tail.mass

    for (const c of tail.connections) {
      const neighbor = world.gears[c.gearId]
      invariant(neighbor)
      stack.push(neighbor)
    }
  }

  return mass
}

export function isNetworkValid(
  root: PartialGear,
  world: World,
): boolean {
  const nmap = new Map<PartialGear, number>()
  const stack = new Array<PartialGear>(root)
  nmap.set(root, 1)

  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)

    const np = nmap.get(gear)
    invariant(np)

    for (const connection of gear.connections) {
      const peer = world.gears[connection.gearId]
      invariant(peer)

      let n: number
      switch (connection.type) {
        case ConnectionType.enum.Adjacent:
          n = (gear.radius / peer.radius) * -1
          break
        case ConnectionType.enum.Chain:
          n = gear.radius / peer.radius
          break
        case ConnectionType.enum.Attach:
          n = 1
          break
        case ConnectionType.enum.Belt:
          invariant(false, 'TODO')
      }

      n = n * np

      let prev = nmap.get(peer)
      if (prev !== undefined) {
        if (n !== prev) {
          return false
        }
      } else {
        nmap.set(peer, n)
        stack.push(peer)
      }
    }
  }

  return true
}
