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
  GearEntity,
  EntityId,
  SimpleVec2,
  World,
  EntityType,
  Entity,
  IAppContext,
  BuildHand,
} from './types.js'

function getConnectionId(a: EntityId, b: EntityId) {
  return a < b ? `${a}.${b}` : `${b}.${a}`
}

const CONNECTION_ITERATOR: {
  entity1: Entity
  entity2: Entity
  type: ConnectionType
} = {
  entity1: null!,
  entity2: null!,
  type: null!,
}

export function* iterateConnections(
  entities: Record<EntityId, Entity>,
) {
  const seen = new Map<string, ConnectionType>()
  for (const entity of Object.values(entities)) {
    for (const connection of entity.connections) {
      const id = getConnectionId(
        entity.id,
        connection.entityId,
      )
      if (seen.has(id)) {
        // sanity check the connection type
        invariant(seen.get(id) === connection.type)
        continue
      }
      seen.set(id, connection.type)

      const peer = entities[connection.entityId]
      invariant(peer)

      CONNECTION_ITERATOR.entity1 = entity
      CONNECTION_ITERATOR.entity2 = peer
      CONNECTION_ITERATOR.type = connection.type

      yield CONNECTION_ITERATOR
    }
  }
}

export function* iterateNetwork(
  root: GearEntity,
  world: World,
) {
  const seen = new Set<GearEntity>()
  const stack = new Array<GearEntity>(root)

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
      invariant(
        connection.type !== ConnectionType.enum.Belt,
        'TODO support belt connections',
      )
      const neighbor = world.entities[connection.entityId]
      invariant(neighbor?.type === EntityType.enum.Gear)
      stack.push(neighbor)
    })
  }
}

export function* iterateGearTileIds(
  center: SimpleVec2,
  radius: number,
) {
  for (let x = -radius; x < radius; x++) {
    for (let y = -radius; y < radius; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))
      const tileId = `${center.x + x}.${center.y + y}`
      yield tileId
    }
  }
}

export function getIntersectingEntities(
  context: IAppContext,
  x: number,
  y: number,
  w: number,
  h: number,
): Entity[] {
  const entities = new Set<Entity>()
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const tileId = `${x + dx}.${y + dy}`
      const tile = context.world.tiles[tileId]
      if (!tile?.entityId) continue
      const found = context.world.entities[tile.entityId]
      invariant(found)
      entities.add(found)
    }
  }
  return [...entities]
}

export function* iterateGearTiles(
  center: SimpleVec2,
  radius: number,
  world: World,
) {
  for (const tileId of iterateGearTileIds(center, radius)) {
    const tile = world.tiles[tileId]
    if (tile) {
      yield tile
    }
  }
}

export function* iterateTiles(
  x: number,
  y: number,
  w: number,
  h: number,
  world: World,
) {
  for (let xx = 0; xx < w; xx += 1) {
    for (let yy = 0; yy < h; yy += 1) {
      const tileId = `${x + xx}.${y + yy}`
      const tile = world.tiles[tileId]
      if (tile) {
        yield { tileId, tile }
      }
    }
  }
}

export function* iterateOverlappingGears(
  center: SimpleVec2,
  radius: number,
  world: World,
) {
  const seen = new Set<EntityId>()

  for (const tile of iterateGearTiles(
    center,
    radius,
    world,
  )) {
    if (!tile.entityId) {
      continue
    }
    if (!seen.has(tile.entityId)) {
      const gear = world.entities[tile.entityId]
      invariant(gear?.type === EntityType.enum.Gear)
      yield gear
    }
    seen.add(tile.entityId)
  }
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
  root: Entity,
  world: World,
): number {
  const stack = new Array<Entity>(root)
  const seen = new Set<Entity>()

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
      const neighbor = world.entities[c.entityId]
      invariant(neighbor)
      stack.push(neighbor)
    }
  }

  return mass
}

// https://stackoverflow.com/a/17323608
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function incrementBuildVersion(
  context: IAppContext,
): void {
  context.buildVersion += 1
  for (const listener of context.buildVersionListeners) {
    listener(context.buildVersion)
  }
}

export function getEntity(
  context: IAppContext,
  id: EntityId,
): Entity {
  const entity = context.world.entities[id]
  invariant(entity)
  return entity
}

export function getExternalConnections(
  context: IAppContext,
  hand: BuildHand,
  root: Entity,
): {
  source: Entity
  target: Entity
  connection: Connection
}[] {
  invariant(hand.valid)
  invariant(hand.entities[root.id] === root)

  const result: ReturnType<typeof getExternalConnections> =
    []

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    invariant(!seen.has(current))
    seen.add(current)

    for (const connection of current.connections) {
      let entity =
        context.world.entities[connection.entityId]
      if (entity) {
        invariant(!hand.entities[entity.id])
        result.push({
          source: current,
          target: entity,
          connection,
        })
        continue
      }
      entity = hand.entities[connection.entityId]
      invariant(entity)
      if (!seen.has(entity)) {
        stack.push(entity)
      }
    }
  }

  return result
}

export function getFirstExternalConnection(
  context: IAppContext,
  hand: BuildHand,
): {
  external: Entity
  root: Entity
  connection: Connection
} | null {
  invariant(hand.valid)

  const root = Object.values(hand.entities).at(0)
  invariant(root)

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    invariant(!seen.has(current))
    seen.add(current)

    for (const connection of current.connections) {
      let entity =
        context.world.entities[connection.entityId]
      if (entity) {
        invariant(!hand.entities[entity.id])
        return { root, external: entity, connection }
      }
      entity = hand.entities[connection.entityId]
      invariant(entity)
      if (!seen.has(entity)) {
        stack.push(entity)
      }
    }
  }

  return null
}

export function resetNetwork(
  context: IAppContext,
  root: Entity,
  ignore: Set<Connection> = new Set(),
): void {
  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    invariant(!seen.has(current))
    seen.add(current)

    current.velocity = 0
    switch (current.type) {
      case EntityType.enum.Gear: {
        current.angle = 0
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        current.offset = 0
        break
      }
      default: {
        invariant(false)
      }
    }

    for (const connection of current.connections) {
      if (ignore.has(connection)) continue
      const neighbor =
        context.world.entities[connection.entityId]
      invariant(neighbor)
      if (!seen.has(neighbor)) {
        stack.push(neighbor)
      }
    }
  }
}
