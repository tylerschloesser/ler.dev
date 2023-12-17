import invariant from 'tiny-invariant'
import { getAccelerationMap } from './apply-torque.js'
import { GEAR_RADIUS_TO_SIZE } from './const.js'
import {
  Action,
  ActionType,
  BuildHand,
  Connection,
  ConnectionType,
  Direction,
  Entity,
  EntityId,
  EntityType,
  Gear,
  GearEntity,
  HandType,
  Network,
  NetworkId,
  SimpleVec2,
  World,
} from './types.js'
import {
  getEntity,
  getIntersectingEntities,
  isHorizontal,
  isVertical,
  iterateGearTileIds,
} from './util.js'
import { Vec2 } from './vec2.js'

export function buildGear(
  world: World,
  gear: GearEntity,
): void {
  let attach: GearEntity | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Attach) {
      const entity = getEntity(world, connection.entityId)
      invariant(entity.type === EntityType.enum.Gear)
      invariant(attach === null)
      attach = entity
    }
  }

  invariant(world.entities[gear.id] === undefined)

  world.entities[gear.id] = gear

  for (const tileId of iterateGearTileIds(
    gear.center,
    gear.radius,
  )) {
    let tile = world.tiles[tileId]

    if (attach) {
      invariant(tile?.entityId === attach.id)
      tile.entityId = gear.id
    } else {
      invariant(tile === undefined)
      tile = world.tiles[tileId] = { entityId: gear.id }
    }
  }
}

export function getBuildHand(
  world: World,
  center: SimpleVec2,
  radius: number,
  chainFrom: Gear | null,
): BuildHand {
  const position: SimpleVec2 = {
    x: center.x - radius,
    y: center.y - radius,
  }

  const connections = new Array<Connection>()

  let valid: boolean = true
  let chain: Gear | undefined
  let attach: Gear | undefined

  const intersecting = getIntersectingEntities(
    world,
    position.x,
    position.y,
    radius * 2,
    radius * 2,
  )

  if (intersecting.length > 1) {
    valid = false
  } else if (intersecting.length === 1) {
    const found = intersecting.at(0)
    invariant(found)
    if (
      found.type === EntityType.enum.Gear &&
      Vec2.equal(found.center, center) &&
      (found.radius === 1 || radius === 1)
    ) {
      if (found.radius === 1 && radius === 1) {
        chain = found
      } else {
        attach = found
      }
    } else {
      valid = false
    }
  }

  if (valid && chainFrom) {
    const dx = center.x - chainFrom.center.x
    const dy = center.y - chainFrom.center.y
    valid =
      (dx === 0 || dy === 0) &&
      dx !== dy &&
      Math.abs(dx + dy) > radius + chainFrom.radius
  }

  if (valid && !chain) {
    // TODO clean this up
    // don't add connections for chain
    // chain connections are copied, then we manually add the chain
    // connection if needed
    connections.push(
      ...getConnections(world, position, center, radius),
    )
    if (chainFrom) {
      connections.push({
        type: ConnectionType.enum.Chain,
        entityId: chainFrom.id,
        multiplier: 1,
      })
    }
    if (attach) {
      connections.push({
        type: ConnectionType.enum.Attach,
        entityId: attach.id,
        multiplier: attach.radius / radius,
      })
    }
  }

  let action: Action
  invariant(!(chain && attach))
  if (chain) {
    action = { type: ActionType.Chain, target: chain }
  } else if (attach) {
    action = { type: ActionType.Attach }
  } else {
    action = { type: ActionType.Build }
  }

  const id: EntityId = `${position.x}.${position.y}`
  const networkId: NetworkId = id

  let gear: Gear
  if (chain) {
    gear = cloneGear(chain)
    gear.networkId = networkId
    if (chainFrom) {
      gear.connections.push({
        type: ConnectionType.enum.Chain,
        entityId: chainFrom.id,
        multiplier: 1,
      })
    }
  } else {
    const size = GEAR_RADIUS_TO_SIZE[radius]
    invariant(size)
    gear = {
      id,
      type: EntityType.enum.Gear,
      networkId,
      position,
      size,
      center,
      angle: chainFrom?.angle ?? 0,
      connections,
      mass: Math.PI * radius ** 2,
      radius,
      velocity: 0,
    }
  }

  const entities = {
    [gear.id]: gear,
  }

  if (chainFrom) {
    const chainFromClone = cloneGear(chainFrom)
    chainFromClone.networkId = networkId
    chainFromClone.connections.push({
      type: ConnectionType.enum.Chain,
      entityId: gear.id,
      multiplier: 1,
    })
    entities[chainFrom.id] = chainFromClone
  }

  if (valid) {
    valid =
      getAccelerationMap(gear, 1, {
        ...world.entities,
        ...entities,
      }) !== null
  }

  const network: Network = {
    id: networkId,
    entityIds: {},
    rootId: gear.id,
    mass: 0,
  }
  for (const entity of Object.values(entities)) {
    network.entityIds[entity.id] = true
    network.mass += entity.mass
  }
  invariant(network.entityIds[network.rootId])
  const networks = {
    [network.id]: network,
  }

  return {
    type: HandType.Build,
    entities,
    networks,
    valid,
    action,
    replace: new Set(),
  }
}

function getConnections(
  world: World,
  position: SimpleVec2,
  center: SimpleVec2,
  radius: number,
): Connection[] {
  const connections: Connection[] = []
  const seen = new Set<Entity>()

  for (const direction of Object.values(Direction)) {
    for (let i = 0; i < 2; i++) {
      let dx: number, dy: number
      switch (direction) {
        case Direction.N: {
          dx = radius - 1 + i
          dy = -1
          break
        }
        case Direction.S: {
          dx = radius - 1 + i
          dy = radius * 2
          break
        }
        case Direction.E: {
          dx = radius * 2
          dy = radius - 1 + i
          break
        }
        case Direction.W: {
          dx = -1
          dy = radius - 1 + i
          break
        }
      }

      const tileId = `${position.x + dx}.${position.y + dy}`
      const tile = world.tiles[tileId]
      if (!tile?.entityId) continue
      const entity = getEntity(world, tile.entityId)

      if (seen.has(entity)) continue
      seen.add(entity)

      switch (entity.type) {
        case EntityType.enum.Gear: {
          let connected: boolean = false
          switch (direction) {
            case Direction.N: {
              connected =
                center.x === entity.center.x &&
                center.y - (radius + entity.radius) ===
                  entity.center.y
              break
            }
            case Direction.S: {
              connected =
                center.x === entity.center.x &&
                center.y + (radius + entity.radius) ===
                  entity.center.y
              break
            }
            case Direction.E: {
              connected =
                center.y === entity.center.y &&
                center.x + (radius + entity.radius) ===
                  entity.center.x
              break
            }
            case Direction.W: {
              connected =
                center.y === entity.center.y &&
                center.x - (radius + entity.radius) ===
                  entity.center.x
              break
            }
          }
          if (connected) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier: -1,
            })
          }
          break
        }
        case EntityType.enum.Belt: {
          let multiplier: number | null = null
          switch (direction) {
            case Direction.N: {
              if (isVertical(entity)) break
              multiplier = entity.rotation === 0 ? 1 : -1
              break
            }
            case Direction.S: {
              if (isVertical(entity)) break
              multiplier = entity.rotation === 0 ? -1 : 1
              break
            }
            case Direction.E: {
              if (isHorizontal(entity)) break
              multiplier = entity.rotation === 90 ? 1 : -1
              break
            }
            case Direction.W: {
              if (isHorizontal(entity)) break
              multiplier = entity.rotation === 90 ? -1 : 1
              break
            }
          }
          if (multiplier !== null) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier,
            })
          }
          break
        }
      }
    }
  }
  return connections
}

function cloneGear(gear: Gear): Gear {
  return {
    ...gear,
    connections: [...gear.connections],
    behavior: gear.behavior && {
      ...gear.behavior,
    },
  }
}
