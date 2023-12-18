import invariant from 'tiny-invariant'
import { getAccelerationMap } from './apply-torque.js'
import { BELT_SIZE } from './const.js'
import {
  Axis,
  Belt,
  BeltDirection,
  BeltEntity,
  BeltTurn,
  BuildHand,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  Gear,
  HandType,
  Network,
  SimpleVec2,
  World,
} from './types.js'
import {
  getEntity,
  getExternalConnections,
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
  // TODO this doesn't seem super safe assumption
  const rootId = `${start.x}.${start.y}`
  const network: Network = {
    id: rootId,
    entityIds: {},
    mass: 0,
    rootId,
  }
  const networks = { [network.id]: network }

  const entities: Record<EntityId, Entity> = {}

  // TODO remove id from get path
  const path = getPath(start, end, startingAxis)
  for (const position of path) {
    addBelt(entities, network, position)
  }
  for (const { position } of Object.values(entities)) {
    const entity = tryGetEntity(
      world,
      undefined,
      position.x,
      position.y,
    )
    if (entity && entity.type !== EntityType.enum.Belt) {
      return {
        type: HandType.Build,
        entities,
        networks,
        valid: false,
      }
    }
  }

  const belts = Object.values(entities).filter(
    (belt): belt is BeltEntity => {
      invariant(belt.type === EntityType.enum.Belt)
      return true
    },
  )
  const build: Pick<BuildHand, 'entities'> = { entities }
  for (const belt of belts) {
    setConnections(world, build, belt)
  }

  const valid = isValid(world, build)

  return {
    type: HandType.Build,
    entities,
    networks,
    valid,
  }
}

function addBelt(
  entities: Record<EntityId, Entity>,
  network: Network,
  position: SimpleVec2,
): void {
  const id = getBeltId(position)
  const mass = 1
  invariant(!entities[id])
  entities[id] = {
    type: EntityType.enum.Belt,
    id,
    networkId: network.id,
    position,
    size: BELT_SIZE,
    connections: [],
    offset: 0,
    velocity: 0,
    mass,
    items: [],
    rotation: 0,
    turn: BeltTurn.enum.None,
    direction: BeltDirection.enum.EastWest,
  }

  invariant(!network.entityIds[id])
  network.entityIds[id] = true
  network.mass += mass
}

function getPath(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
): Array<SimpleVec2> {
  const path = new Array<SimpleVec2>()

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

  if (startingAxis === 'x') {
    for (let x = 0; x < Math.abs(dx); x++) {
      path.push({
        x: start.x + x * sx,
        y: start.y,
      })
    }

    if (dy === 0) return path

    let y = 0
    if (dx !== 0) {
      path.push({
        x: start.x + dx,
        y: start.y,
      })
      y += 1
    }

    for (; y <= Math.abs(dy); y++) {
      path.push({
        x: start.x + dx,
        y: start.y + y * sy,
      })
    }
  } else {
    invariant(startingAxis === 'y')

    for (let y = 0; y < Math.abs(dy); y++) {
      path.push({
        x: start.x,
        y: start.y + y * sy,
      })
    }

    if (dx === 0) return path

    let x = 0
    if (dy !== 0) {
      path.push({
        x: start.x,
        y: start.y + dy,
      })
      x += 1
    }

    for (; x <= Math.abs(dx); x++) {
      path.push({
        x: start.x + x * sx,
        y: start.y + dy,
      })
    }
  }

  return path
}

function getBeltId(position: SimpleVec2): EntityId {
  return `${position.x}.${position.y}`
}

function isValid(
  world: World,
  build: Pick<BuildHand, 'entities'>,
): boolean {
  // TODO verify that belts only contain two belt connections max

  const root = Object.values(build.entities).at(0)
  invariant(root)

  const first = getExternalConnections(
    world,
    build.entities,
    root,
  ).at(0)

  if (!first) {
    // no adjacent entity, belt is not moving
    return true
  }

  const entities = { ...world.entities, ...build.entities }

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

function tryGetEntity(
  world: World,
  build: Pick<BuildHand, 'entities'> | undefined,
  x: number,
  y: number,
): Entity | undefined {
  const tile = world.tiles[`${x}.${y}`]
  if (tile?.entityId) {
    return getEntity(world, tile.entityId)
  }
  return build?.entities[`${x}.${y}`]
}

function getAdjacentEntities(
  world: World,
  build: Pick<BuildHand, 'entities'>,
  belt: BeltEntity,
): {
  north?: Entity
  south?: Entity
  east?: Entity
  west?: Entity
} {
  const {
    position: { x, y },
  } = belt
  return {
    north: tryGetEntity(world, build, x, y - 1),
    south: tryGetEntity(world, build, x, y + 1),
    east: tryGetEntity(world, build, x + 1, y),
    west: tryGetEntity(world, build, x - 1, y),
  }
}

function isGearEdge(
  gear: Gear,
  x: number,
  y: number,
): boolean {
  if (gear.center.x === x) {
    return (
      gear.center.y + gear.radius === y ||
      gear.center.y - gear.radius === y
    )
  } else if (gear.center.y === y) {
    return (
      gear.center.x + gear.radius === x ||
      gear.center.x - gear.radius === x
    )
  }
  return false
}

function setConnections(
  world: World,
  build: Pick<BuildHand, 'entities'>,
  belt: BeltEntity,
): void {
  invariant(belt.connections.length === 0)

  const {
    position: { x, y },
    connections,
  } = belt

  invariant(connections.length === 0)

  const { north, south, east, west } = getAdjacentEntities(
    world,
    build,
    belt,
  )

  switch (north?.type) {
    case EntityType.enum.Gear: {
      if (
        isGearEdge(north, x, y) ||
        isGearEdge(north, x + 1, y)
      ) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          entityId: north.id,
          multiplier: -1,
        })
      }
      break
    }
    case EntityType.enum.Belt: {
      connections.push({
        type: ConnectionType.enum.Belt,
        entityId: north.id,
        multiplier:
          west?.type === EntityType.enum.Belt ? -1 : 1,
      })
      break
    }
  }
  switch (south?.type) {
    case EntityType.enum.Gear: {
      if (
        isGearEdge(south, x, y + 1) ||
        isGearEdge(south, x + 1, y + 1)
      ) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          entityId: south.id,
          multiplier: 1,
        })
      }
      break
    }
    case EntityType.enum.Belt: {
      connections.push({
        type: ConnectionType.enum.Belt,
        entityId: south.id,
        multiplier:
          east?.type === EntityType.enum.Belt ? -1 : 1,
      })
      break
    }
  }
  switch (east?.type) {
    case EntityType.enum.Gear: {
      if (
        isGearEdge(east, x + 1, y) ||
        isGearEdge(east, x + 1, y + 1)
      ) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          entityId: east.id,
          multiplier: -1,
        })
      }
      break
    }
    case EntityType.enum.Belt: {
      connections.push({
        type: ConnectionType.enum.Belt,
        entityId: east.id,
        multiplier: 1,
      })
      break
    }
  }
  switch (west?.type) {
    case EntityType.enum.Gear: {
      if (
        isGearEdge(west, x, y) ||
        isGearEdge(west, x, y + 1)
      ) {
        connections.push({
          type: ConnectionType.enum.Adjacent,
          entityId: west.id,
          multiplier: 1,
        })
      }
      break
    }
    case EntityType.enum.Belt: {
      connections.push({
        type: ConnectionType.enum.Belt,
        entityId: west.id,
        multiplier: 1,
      })
      break
    }
  }
}
