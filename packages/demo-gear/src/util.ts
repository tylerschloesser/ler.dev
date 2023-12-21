import invariant from 'tiny-invariant'
import {
  MAX_TILE_SIZE_FACTOR,
  MAX_ZOOM,
  MIN_TILE_SIZE_FACTOR,
  MIN_ZOOM,
  PI,
} from './const.js'
import {
  Belt,
  BeltDirection,
  BeltEntity,
  BeltPath,
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
  Rotation,
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
  world: World,
  x: number,
  y: number,
  w: number,
  h: number,
): Entity[] {
  const entities = new Set<Entity>()
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const tileId = `${x + dx}.${y + dy}`
      const tile = world.tiles[tileId]
      if (!tile?.entityId) continue
      const found = world.entities[tile.entityId]
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
  world: World,
  id: EntityId,
): Entity {
  const entity = world.entities[id]
  invariant(entity)
  return entity
}

export function getExternalConnections(
  world: World,
  buildEntities: World['entities'],
  root: Entity,
): {
  source: Entity
  target: Entity
  connection: Connection
}[] {
  const worldEntities = world.entities
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
        // TODO we're now allowing this...
        // invariant(!buildEntities[entity.id])
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
      case EntityType.enum.Belt: {
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
  world: World,
  hand: BuildHand,
  root: Entity,
): Record<
  NetworkId,
  {
    externalEntity: Entity
    internalEntity: Entity
    incomingVelocity: number
    multiplier: number
  }
> {
  invariant(Object.keys(hand.networks).length === 1)

  const result: ReturnType<typeof getExternalNetworks> = {}

  const worldEntities = world.entities
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
        const entry = result[entity.networkId]
        if (!entry) {
          result[entity.networkId] = {
            externalEntity: entity,
            internalEntity: current.entity,
            incomingVelocity: entity.velocity,
            multiplier: 1 / multiplier,
          }
        } else {
          // incoming velocities should be the same for all
          // entities on the same network
          invariant(
            Math.abs(
              entry.incomingVelocity * entry.multiplier -
                entity.velocity * (1 / multiplier),
            ) < Number.EPSILON,
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
  world: World,
  entityId: EntityId,
): void {
  const entity = world.entities[entityId]
  invariant(entity)
  delete world.entities[entityId]

  // TODO switch to size in entity
  let size: SimpleVec2
  let attachedGearId: EntityId | undefined
  switch (entity.type) {
    case EntityType.enum.Gear:
      size = { x: entity.radius * 2, y: entity.radius * 2 }
      // TODO fix this hack
      attachedGearId = entity.connections.find(
        (c) => c.type === ConnectionType.enum.Attach,
      )?.entityId
      break
    case EntityType.enum.Belt: {
      size = { x: 1, y: 1 }
      break
    }
  }

  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      // prettier-ignore
      const tileId = `${entity.position.x + x}.${entity.position.y + y}`
      const tile = world.tiles[tileId]
      invariant(tile)

      if (attachedGearId) {
        // when removing the larger gear, tiles will be either entityId or attachedGearId
        //
        // when removing the smaller gear, all tiles will be entityId

        invariant(entity.type === EntityType.enum.Gear)
        if (entity.radius === 1) {
          // this is the smaller gear

          invariant(tile.entityId === entityId)
          tile.entityId = attachedGearId
          continue
        }
        {
          // this is the larger gear

          if (tile.entityId === entityId) {
            // handle this like normal
          } else {
            invariant(tile.entityId === attachedGearId)
            // do nothing, this will remain the smaller gear
            continue
          }
        }
      }

      invariant(tile.entityId === entity.id)
      if (!tile.resourceType) {
        delete world.tiles[tileId]
      } else {
        delete tile.entityId
      }
    }
  }

  // delete connections
  for (const connection of entity.connections) {
    const target = world.entities[connection.entityId]
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

  const network = world.networks[entity.networkId]
  invariant(network?.entityIds[entityId])

  delete network.entityIds[entityId]
  delete world.networks[network.id]

  if (Object.keys(network.entityIds).length > 0) {
    const seen = new Set<Entity>()

    for (const rootId of Object.keys(network.entityIds)) {
      const root = world.entities[rootId]
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
      world.networks[newNetwork.id] = newNetwork

      const stack = new Array<Entity>(root)
      while (stack.length) {
        const current = stack.pop()
        invariant(current)

        if (seen.has(current)) continue
        seen.add(current)

        invariant(!newNetwork.entityIds[current.id])
        newNetwork.entityIds[current.id] = true
        newNetwork.mass += current.mass

        invariant(current.networkId === network.id)
        current.networkId = newNetwork.id

        for (const connection of current.connections) {
          const neighbor =
            world.entities[connection.entityId]
          invariant(neighbor)

          stack.push(neighbor)
        }
      }
    }
  }

  if (entity.type === EntityType.enum.Belt) {
    updateBeltPathsAfterDelete(world, entity)
  }
}

function updateBeltPathsAfterDelete(
  world: World,
  entity: BeltEntity,
): void {
  delete world.paths[entity.pathId]

  const roots = new Array<Belt>()
  for (const connection of entity.connections) {
    if (connection.type !== ConnectionType.enum.Belt)
      continue
    const root = world.entities[connection.entityId]
    invariant(root?.type === EntityType.enum.Belt)
    roots.push(root)
  }

  invariant(roots.length <= 2)

  const getBelt = (id: EntityId) => {
    invariant(id !== entity.id)
    const found = world.entities[id]
    invariant(found?.type === EntityType.enum.Belt)
    return found
  }

  const setPath = (path: BeltPath) => {
    invariant(!world.paths[path.id])
    world.paths[path.id] = path
  }

  updateBeltPathsForRoots(roots, getBelt, setPath)
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
  world: World,
  hand: BuildHand,
): void {
  const root = Object.values(hand.entities).at(0)
  invariant(root)

  for (const entity of Object.values(hand.entities)) {
    entity.velocity = 0
  }

  const network = Object.values(hand.networks).at(0)
  invariant(network)

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

    current.entity.velocity

    const existing = world.entities[current.entity.id]
    if (existing) {
      // TODO validate existing (e.g. size and connections)
      root.velocity +=
        (1 / current.multiplier) *
        existing.velocity *
        Math.sqrt(existing.mass / network.mass)
      deleteEntity(world, existing.id)
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

export function isBelt(entity?: Entity): entity is Belt {
  if (!entity) {
    return false
  }
  return entity.type === EntityType.enum.Belt
}

export function toRadians(rotation: Rotation): number {
  return (rotation * PI) / 180
}

export function isHorizontal(belt: Belt): boolean
export function isHorizontal(rotation: Rotation): boolean
export function isHorizontal(v: Belt | Rotation) {
  let rotation: number
  if (typeof v === 'number') {
    rotation = v
  } else {
    rotation = v.rotation
  }
  return rotation === 0 || rotation === 180
}

export function isVertical(belt: Belt): boolean
export function isVertical(rotation: Rotation): boolean
export function isVertical(v: Belt | Rotation) {
  let rotation: number
  if (typeof v === 'number') {
    rotation = v
  } else {
    rotation = v.rotation
  }
  return rotation === 90 || rotation === 270
}

export function* iterateBeltPath(
  root: Belt,
  start: Belt,
  getBelt: (id: EntityId) => Belt,
) {
  const seen = new Set<Belt>()
  seen.add(root)

  const stack = new Array<Belt>(start)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    if (seen.has(current)) continue
    seen.add(current)
    yield current

    const adjacent = new Array<Belt>()

    for (const connection of current.connections) {
      if (connection.type !== ConnectionType.enum.Belt)
        continue
      const neighbor = getBelt(connection.entityId)
      adjacent.push(neighbor)
    }

    invariant(adjacent.length <= 2)
    const [a, b] = adjacent
    if (a && !seen.has(a)) {
      stack.push(a)
    } else if (b && !seen.has(b)) {
      stack.push(b)
    }
  }
}

export function updateBeltPathsForRoots(
  roots: Belt[],
  getBelt: (id: EntityId) => Belt,
  setPath: (path: BeltPath) => void,
): void {
  const seen = new Set<Belt>()

  for (const root of roots) {
    if (root.type !== EntityType.enum.Belt) continue
    if (seen.has(root)) continue
    seen.add(root)

    const adjacent = new Array<Belt>()
    for (const connection of root.connections) {
      if (connection.type !== ConnectionType.enum.Belt)
        continue
      const neighbor = getBelt(connection.entityId)
      adjacent.push(neighbor)
    }

    const beltIds = new Array<EntityId>(root.id)

    let loop = false

    invariant(adjacent.length <= 2)
    const [a, b] = adjacent
    if (a) {
      for (const belt of iterateBeltPath(
        root,
        a,
        getBelt,
      )) {
        if (seen.has(belt)) {
          loop = true
          break
        }
        seen.add(belt)
        beltIds.push(belt.id)
      }
    }
    if (b && !loop) {
      for (const belt of iterateBeltPath(
        root,
        b,
        getBelt,
      )) {
        if (seen.has(belt)) {
          loop = true
          break
        }
        seen.add(belt)
        beltIds.unshift(belt.id)
      }
    }

    const pathId = beltIds.at(0)
    invariant(pathId)

    const config: BeltPath['config'] = {}

    for (const beltId of beltIds) {
      getBelt(beltId).pathId = pathId
    }

    let invert = false
    const [firstId, secondId] = beltIds
    if (firstId && secondId) {
      const first = getBelt(firstId)
      const second = getBelt(secondId)

      const dx = second.position.x - first.position.x
      const dy = second.position.y - first.position.y
      invariant(dx === 0 || dy === 0)

      switch (first.direction) {
        case BeltDirection.enum.EastWest: {
          invariant(dx === 1 || dx === -1)
          if (dx === -1) {
            invert = true
          }
          break
        }
        case BeltDirection.enum.NorthSouth: {
          invariant(dy === 1 || dy === -1)
          if (dy === -1) {
            invert = true
          }
          break
        }
        case BeltDirection.enum.NorthEast: {
          invariant(dy === -1 || dx === 1)
          if (dy === -1) {
            invert = true
          }
          break
        }
        case BeltDirection.enum.NorthWest: {
          invariant(dy === -1 || dx === -1)
          if (dx === -1) {
            invert = true
          }
          break
        }
        case BeltDirection.enum.SouthEast: {
          invariant(dy === -1 || dx === 1)
          if (dy === -1) {
            invert = true
          }
          break
        }
        case BeltDirection.enum.SouthWest: {
          invariant(dy === -1 || dx === -1)
          if (dx === -1) {
            invert = true
          }
          break
        }
        default:
          invariant(false)
      }
    }

    for (const beltId of beltIds) {
      const belt = getBelt(beltId)
      switch (belt.direction) {
        case BeltDirection.enum.NorthWest:
        case BeltDirection.enum.SouthEast:
          invert = !invert
          break
        // case BeltDirection.enum.EastWest:
        // case BeltDirection.enum.NorthSouth:
        // case BeltDirection.enum.SouthWest:
        // case BeltDirection.enum.NorthEast:
      }
      config[belt.id] = { invert }
    }

    setPath({
      id: pathId,
      beltIds,
      // TODO preserve items
      items: [],
      invert,
      loop,
      config,
    })
  }
}
