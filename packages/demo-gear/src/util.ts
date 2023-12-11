import invariant from 'tiny-invariant'
import {
  MAX_TILE_SIZE_FACTOR,
  MAX_ZOOM,
  MIN_TILE_SIZE_FACTOR,
  MIN_ZOOM,
} from './const.js'
import {
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  GearEntity,
  IAppContext,
  NetworkId,
  SimpleVec2,
  World,
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
  buildEntities: World['entities'],
  root: Entity,
): {
  source: Entity
  target: Entity
  connection: Connection
}[] {
  const worldEntities = context.world.entities
  invariant(buildEntities[root.id] === root)

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
      let entity = worldEntities[connection.entityId]
      if (entity) {
        invariant(!buildEntities[entity.id])
        result.push({
          source: current,
          target: entity,
          connection,
        })
        continue
      }
      entity = buildEntities[connection.entityId]
      invariant(entity)
      if (!seen.has(entity)) {
        stack.push(entity)
      }
    }
  }

  return result
}

export function resetEntities(
  entities: World['entities'],
): void {
  for (const entity of Object.values(entities)) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        entity.angle = 0
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        entity.offset = 0
        break
      }
      default: {
        invariant(false)
      }
    }
  }
}

export function getExternalNetworks(
  context: IAppContext,
  hand: BuildHand,
  root: Entity,
): Record<
  NetworkId,
  {
    externalEntity: Entity
    internalEntity: Entity
    incomingVelocity: number
  }
> {
  invariant(Object.keys(hand.networks).length === 1)

  const result: ReturnType<typeof getExternalNetworks> = {}

  const worldEntities = context.world.entities
  const buildEntities = hand.entities

  const seen = new Set<Entity>()
  const stack = new Array<{
    entity: Entity
    multiplier: number
  }>({
    entity: root,
    multiplier: 1,
  })

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    invariant(!seen.has(current.entity))
    seen.add(current.entity)

    for (const connection of current.entity.connections) {
      let entity = worldEntities[connection.entityId]
      const multiplier =
        connection.multiplier * current.multiplier
      invariant(multiplier !== 0)
      if (entity) {
        let entry = result[entity.networkId]
        if (!entry) {
          result[entity.networkId] = {
            externalEntity: entity,
            internalEntity: current.entity,
            incomingVelocity:
              entity.velocity * (1 / multiplier),
          }
        } else {
          // incoming velocities should be the same for all
          // entities on the same network
          invariant(
            entry.incomingVelocity ===
              entity.velocity * (1 / multiplier),
          )
        }
        continue
      }

      entity = buildEntities[connection.entityId]
      invariant(entity)
      if (!seen.has(entity)) {
        stack.push({ entity, multiplier })
      }
    }
  }

  return result
}
