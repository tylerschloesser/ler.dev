import invariant from 'tiny-invariant'
import { GeneratedIdentifierFlags } from 'typescript'
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
  Network,
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
  // TODO this is a hack so we can use for build
  requirePeer: boolean = true,
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
      if (requirePeer) {
        invariant(peer)
      } else {
        if (!peer) continue
      }

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

export function deleteEntity(
  context: IAppContext,
  entityId: EntityId,
): void {
  const entity = context.world.entities[entityId]
  invariant(entity)
  delete context.world.entities[entityId]

  let size: SimpleVec2
  let attachedGearId: EntityId | undefined
  switch (entity.type) {
    case EntityType.enum.Gear:
      size = { x: entity.radius * 2, y: entity.radius * 2 }
      // TODO fix this hack
      // if there is an attach connection, and this gear is larger
      // than radius 1, we know there is an attached gear that
      // is taking up tiles, so ignore those when updating tiles
      if (entity.radius > 1) {
        attachedGearId = entity.connections.find(
          (c) => c.type === ConnectionType.enum.Attach,
        )?.entityId
      }
      break
    case EntityType.enum.Belt:
    case EntityType.enum.BeltIntersection: {
      size = { x: 1, y: 1 }
      break
    }
  }

  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      // prettier-ignore
      const tileId = `${entity.position.x + x}.${entity.position.y + y}`
      const tile = context.world.tiles[tileId]

      if (tile?.entityId === attachedGearId) {
        // TODO fix this hack
        continue
      }

      invariant(tile?.entityId === entity.id)
      if (!tile.resourceType) {
        delete context.world.tiles[tileId]
      } else {
        delete tile.entityId
      }
    }
  }

  // delete connections
  for (const connection of entity.connections) {
    const target =
      context.world.entities[connection.entityId]
    invariant(target)
    const index = target.connections.findIndex(
      (c) =>
        // TODO assert multiplier?
        c.entityId === entity.id &&
        c.type === connection.type,
    )
    invariant(index !== -1)
    target.connections.splice(index, 1)
  }

  const network = context.world.networks[entity.networkId]
  invariant(network?.entityIds[entityId])

  delete network.entityIds[entityId]
  delete context.world.networks[network.id]

  if (Object.keys(network.entityIds).length > 0) {
    const seen = new Set<Entity>()

    for (const rootId of Object.keys(network.entityIds)) {
      const root = context.world.entities[rootId]
      invariant(root)
      if (seen.has(root)) {
        continue
      }

      const newNetwork: Network = {
        entityIds: {},
        id: rootId,
        mass: 0,
        rootId,
      }
      context.world.networks[newNetwork.id] = newNetwork

      const stack = new Array<Entity>(root)
      while (stack.length) {
        const current = stack.pop()
        invariant(current)

        if (seen.has(current)) continue
        seen.add(current)

        invariant(!newNetwork.entityIds[entityId])
        newNetwork.entityIds[entityId] = true
        newNetwork.mass += current.mass

        for (const connection of current.connections) {
          const neighbor =
            context.world.entities[connection.entityId]
          invariant(neighbor)

          stack.push(neighbor)
        }
      }

      root.velocity *= Math.sqrt(
        network.mass / newNetwork.mass,
      )
      propogateVelocity(root, context.world.entities)
    }
  }
}

export function propogateVelocity(
  root: Entity,
  entities: World['entities'],
): void {
  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)
  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    if (seen.has(current)) continue
    seen.add(current)
    for (const connection of current.connections) {
      const entity = entities[connection.entityId]

      // TODO be smarter about this
      if (!entity) continue

      invariant(entity.networkId === root.networkId)
      if (!seen.has(entity)) {
        entity.velocity =
          current.velocity * connection.multiplier
        stack.push(entity)
      }
    }
  }
}

export function mergeBuildEntities(
  context: IAppContext,
  hand: BuildHand,
): void {
  const root = Object.values(hand.entities).at(0)
  invariant(root)

  root.velocity = 0

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
    if (seen.has(current.entity)) continue
    seen.add(current.entity)

    const existing =
      context.world.entities[current.entity.id]
    if (existing) {
      // TODO validate existing (e.g. size and connections)
      root.velocity +=
        existing.velocity * (1 / current.multiplier)
      deleteEntity(context, existing.id)
    }

    for (const connection of current.entity.connections) {
      const peer = hand.entities[connection.entityId]
      // will be undefined for connections to existing entities
      if (!peer) continue
      stack.push({
        entity: peer,
        multiplier:
          current.multiplier * connection.multiplier,
      })
    }
  }

  propogateVelocity(root, hand.entities)
}
