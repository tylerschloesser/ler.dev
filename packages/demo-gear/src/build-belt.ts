import invariant from 'tiny-invariant'
import { getAccelerationMap } from './apply-torque.js'
import { BELT_SIZE } from './const.js'
import {
  Axis,
  Belt,
  BeltTurn,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  HandType,
  Network,
  Rotation,
  SimpleVec2,
  World,
} from './types.js'
import {
  getEntity,
  getExternalConnections,
  isHorizontal,
  isVertical,
} from './util.js'

export function buildBelt(world: World, belt: Belt): void {
  invariant(world.entities[belt.id] === undefined)
  world.entities[belt.id] = belt

  const { x, y } = belt.position
  const tileId = `${x}.${y}`
  let tile = world.tiles[tileId]
  if (!tile) {
    tile = world.tiles[tileId] = {}
  }
  invariant(tile.entityId === undefined)
  tile.entityId = belt.id
}

export function getBuildHand(
  world: World,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
): BuildHand {
  const belts = new Array<Belt>()

  // TODO this doesn't seem super safe assumption
  const rootId = `${start.x}.${start.y}`
  const network: Network = {
    id: rootId,
    entityIds: {},
    mass: 0,
    rootId,
  }

  for (const {
    position,
    rotation,
    turn,
  } of iterateBeltPositions(start, end, startingAxis)) {
    addBelt(world, network, belts, position, rotation, turn)
  }

  const valid = isValid(world, belts)

  const entities: Record<EntityId, Entity> = {}
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  return {
    type: HandType.Build,
    entities,
    networks: { [network.id]: network },
    valid,
    replace: new Set(),
  }
}

function addBelt(
  world: World,
  network: Network,
  belts: Belt[],
  position: SimpleVec2,
  rotation: Rotation,
  turn: BeltTurn,
): void {
  const id = getBeltId(position)
  const connections = getBeltConnections(
    world,
    position,
    rotation,
    turn,
  )
  const prev = belts.at(-1)
  if (prev) {
    prev.connections.push({
      entityId: id,
      multiplier: 1,
      type: ConnectionType.enum.Belt,
    })
    connections.push({
      entityId: prev.id,
      multiplier: 1,
      type: ConnectionType.enum.Belt,
    })
  }

  const mass = 1
  belts.push({
    type: EntityType.enum.Belt,
    id,
    networkId: network.id,
    position,
    size: BELT_SIZE,
    connections,
    offset: 0,
    velocity: 0,
    mass,
    items: [],
    rotation,
    turn,
  })

  invariant(!network.entityIds[id])
  network.entityIds[id] = true
  network.mass += mass
}

function* iterateBeltPositions(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
) {
  let dx = end ? end.x - start.x : 0
  let dy = end ? end.y - start.y : 0

  if (dx === 0 && dy === 0) {
    if (startingAxis === 'x') {
      dx = 1
    } else {
      invariant(startingAxis === 'y')
      dy = 1
    }
  }

  const sx = Math.sign(dx)
  const sy = Math.sign(dy)

  const iter: {
    position: SimpleVec2
    rotation: Rotation
    turn: BeltTurn
  } = {
    position: null!,
    rotation: null!,
    turn: null!,
  }

  if (startingAxis === 'x') {
    iter.rotation = sx === 1 ? 0 : 180
    iter.turn = BeltTurn.enum.None
    for (let x = 0; x < Math.abs(dx); x++) {
      iter.position = {
        x: start.x + x * sx,
        y: start.y,
      }
      yield iter
    }

    if (dy === 0) return

    let y = 0
    if (dx !== 0) {
      iter.turn =
        sx * sy === 1
          ? BeltTurn.enum.Right
          : BeltTurn.enum.Left
      iter.position = {
        x: start.x + dx,
        y: start.y,
      }
      yield iter
      y += 1
    }

    iter.turn = BeltTurn.enum.None
    iter.rotation = sy === 1 ? 90 : 270

    for (; y <= Math.abs(dy); y++) {
      iter.position = {
        x: start.x + dx,
        y: start.y + y * sy,
      }
      yield iter
    }
  } else {
    invariant(startingAxis === 'y')

    iter.rotation = sy === 1 ? 90 : 270
    iter.turn = BeltTurn.enum.None
    for (let y = 0; y < Math.abs(dy); y++) {
      iter.position = {
        x: start.x,
        y: start.y + y * sy,
      }
      yield iter
    }

    if (dx === 0) return

    let x = 0
    if (dy !== 0) {
      iter.turn =
        sy * sx === 1
          ? BeltTurn.enum.Left
          : BeltTurn.enum.Right
      iter.position = {
        x: start.x,
        y: start.y + dy,
      }
      yield iter
      x += 1
    }

    iter.turn = BeltTurn.enum.None
    iter.rotation = sx === 1 ? 0 : 180

    for (; x <= Math.abs(dx); x++) {
      iter.position = {
        x: start.x + x * sx,
        y: start.y + dy,
      }
      yield iter
    }
  }
}

function getBeltId(position: SimpleVec2): EntityId {
  return `${position.x}.${position.y}`
}

function isValid(world: World, belts: Belt[]): boolean {
  for (const { position } of belts) {
    const tileId = `${position.x}.${position.y}`
    const tile = world.tiles[tileId]
    if (!tile) continue
    if (tile.entityId) {
      return false
    }
  }

  const buildEntities = Object.values(belts).reduce(
    (acc, belt) => ({
      ...acc,
      [belt.id]: belt,
    }),
    {},
  )

  const root = Object.values(belts).at(0)
  invariant(root)

  const first = getExternalConnections(
    world,
    buildEntities,
    root,
  ).at(0)

  if (!first) {
    // no adjacent entity, belt is not moving
    return true
  }

  const entities = { ...world.entities }
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const accelerationMap = getAccelerationMap(
    first.source,
    1,
    entities,
  )

  if (!accelerationMap) {
    return false
  }

  return true
}

function getBeltConnections(
  world: World,
  position: SimpleVec2,
  rotation: Rotation,
  turn: BeltTurn,
): Connection[] {
  const connections: Connection[] = []

  if (turn !== BeltTurn.enum.None) {
    // TODO
    return connections
  }

  if (isHorizontal(rotation)) {
    // prettier-ignore
    const north = world.tiles[`${position.x}.${position.y - 1}`]
    if (north?.entityId) {
      const entity = getEntity(world, north.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.x !== position.x &&
            entity.center.x !== position.x + 1
          ) {
            break
          }

          if (
            entity.center.y + entity.radius !==
            position.y
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: rotation === 0 ? -1 : 1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
    // prettier-ignore
    const south = world.tiles[`${position.x}.${position.y + 1}`]
    if (south?.entityId) {
      const entity = getEntity(world, south.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.x !== position.x &&
            entity.center.x !== position.x + 1
          ) {
            break
          }

          if (
            entity.center.y - entity.radius - 1 !==
            position.y
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: rotation === 0 ? 1 : -1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }

    const east =
      world.tiles[`${position.x + 1}.${position.y}`]
    if (east?.entityId) {
      const entity = getEntity(world, east.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }

    const west =
      world.tiles[`${position.x - 1}.${position.y}`]
    if (west?.entityId) {
      const entity = getEntity(world, west.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }
  } else {
    invariant(isVertical(rotation))

    // prettier-ignore
    const east = world.tiles[`${position.x + 1}.${position.y}`]
    if (east?.entityId) {
      const entity = getEntity(world, east.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.y !== position.y &&
            entity.center.y !== position.y + 1
          ) {
            break
          }

          if (
            entity.center.x - entity.radius - 1 !==
            position.x
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: rotation === 90 ? -1 : 1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
    const west =
      world.tiles[`${position.x - 1}.${position.y}`]
    if (west?.entityId) {
      const entity = getEntity(world, west.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.y !== position.y &&
            entity.center.y !== position.y + 1
          ) {
            break
          }

          if (
            entity.center.x + entity.radius !==
            position.x
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: rotation === 90 ? 1 : -1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }

    const north =
      world.tiles[`${position.x}.${position.y + 1}`]
    if (north?.entityId) {
      const entity = getEntity(world, north.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }

    const south =
      world.tiles[`${position.x}.${position.y - 1}`]
    if (south?.entityId) {
      const entity = getEntity(world, south.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }
  }

  return connections
}
