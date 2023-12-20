import invariant from 'tiny-invariant'
import { buildBelt } from './build-belt.js'
import { buildGear } from './build-gear.js'
import {
  Belt,
  BeltPath,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  IAppContext,
  World,
} from './types.js'
import {
  getExternalNetworks,
  incrementBuildVersion,
  isBelt,
  iterateBeltPath,
  mergeBuildEntities,
  propogateVelocity,
} from './util.js'

function mergeBeltPaths(
  world: World,
  hand: BuildHand,
): void {
  const seen = new Set<Belt>()

  // at this point during build, we should have already removed
  // existing, overlapped belts. so each belt Id should be in
  // either hand or world, but not both
  const getBelt = (id: EntityId) => {
    let entity = world.entities[id]
    if (entity) {
      invariant(entity.type === EntityType.enum.Belt)
      invariant(!hand.entities[id])
      return entity
    }
    entity = hand.entities[id]
    invariant(entity?.type === EntityType.enum.Belt)
    return entity
  }

  for (const root of Object.values(hand.entities)) {
    if (root.type !== EntityType.enum.Belt) continue
    if (seen.has(root)) continue
    seen.add(root)

    const adjacent = new Array<Belt>()
    for (const connection of root.connections) {
      if (connection.type !== ConnectionType.enum.Belt)
        continue

      let neighbor = hand.entities[connection.entityId]
      if (!neighbor) {
        neighbor = world.entities[connection.entityId]
      } else {
        invariant(!world.entities[connection.entityId])
      }
      invariant(neighbor?.type === EntityType.enum.Belt)
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
      let belt = world.entities[beltId]
      if (belt) {
        invariant(!hand.entities[beltId])
        invariant(belt.type === EntityType.enum.Belt)
        delete world.paths[belt.pathId]
      } else {
        belt = hand.entities[beltId]
        invariant(belt?.type === EntityType.enum.Belt)
      }
      belt.pathId = pathId
    }

    invariant(!world.paths[pathId])
    world.paths[pathId] = {
      id: pathId,
      beltIds,
      // TODO preserve items
      items: [],
      loop,
      config,
    }
  }
}

export function build(world: World, hand: BuildHand): void {
  validateBuild(world, hand)

  // assumption: all entities are connected (i.e. within the same network)

  mergeBuildEntities(world, hand)

  mergeBeltPaths(world, hand)

  const root = Object.values(hand.entities).at(0)
  invariant(root)

  const newNetwork = Object.values(hand.networks).at(0)
  invariant(newNetwork)
  world.networks[newNetwork.id] = newNetwork

  const externalNetworks = getExternalNetworks(
    world,
    hand,
    root,
  )

  const momentum = [root.velocity * newNetwork.mass]

  for (const [networkId, value] of Object.entries(
    externalNetworks,
  )) {
    const network = world.networks[networkId]
    invariant(network)

    newNetwork.mass += network.mass

    const velocity =
      value.incomingVelocity * value.multiplier

    momentum.push(network.mass * velocity)

    for (const entityId of Object.keys(network.entityIds)) {
      const entity = world.entities[entityId]
      invariant(entity?.networkId === network.id)
      entity.networkId = newNetwork.id
      invariant(!newNetwork.entityIds[entity.id])
      newNetwork.entityIds[entity.id] = true
    }

    delete world.networks[networkId]
  }

  root.velocity =
    momentum.reduce((a, m) => a + m, 0) / newNetwork.mass

  world.networks[newNetwork.id] = newNetwork

  for (const entity of Object.values(hand.entities)) {
    // must happen first because of gear logic atm
    addReverseConnections(world, hand, entity)

    switch (entity.type) {
      case EntityType.enum.Gear: {
        buildGear(world, entity)
        break
      }
      case EntityType.enum.Belt: {
        buildBelt(world, entity)
        break
      }
      default: {
        invariant(false, 'TODO')
      }
    }
  }

  propogateVelocity(root, world.entities)

  // TODO be smarter about this
  resetGearAngles(world)
  resetBeltOffsets(world, hand)
}

function resetBeltOffsets(world: World, hand: BuildHand) {
  const seen = new Set<Belt>()

  for (const root of Object.values(hand.entities)) {
    invariant(world.entities[root.id] === root)

    if (
      root.type !== EntityType.enum.Belt ||
      seen.has(root)
    ) {
      continue
    }

    const stack = new Array<Belt>(root)

    while (stack.length) {
      const current = stack.pop()
      invariant(current)

      if (seen.has(current)) continue
      seen.add(current)

      current.offset = 0

      for (const connection of current.connections) {
        if (connection.type === ConnectionType.enum.Belt) {
          const neighbor =
            world.entities[connection.entityId]
          invariant(neighbor && isBelt(neighbor))
          stack.push(neighbor)
        }
      }
    }
  }
}

function resetGearAngles(world: World): void {
  for (const entity of Object.values(world.entities)) {
    if (entity.type === EntityType.enum.Gear) {
      entity.angle = 0
    }
  }
}

export function addConnection(
  context: IAppContext,
  source: Entity,
  target: Entity,
  connection: Connection,
): void {
  invariant(source.type === EntityType.enum.Gear)
  invariant(target.type === EntityType.enum.Gear)
  invariant(connection.type === ConnectionType.enum.Chain)
  invariant(connection.multiplier === 1)
  invariant(target.id === connection.entityId)

  // there shouldn't be any existing connections
  // from source to target
  invariant(
    !source.connections.find(
      (c) => c.entityId === target.id,
    ),
  )

  source.connections.push(connection)
  target.connections.push({
    type: connection.type,
    entityId: source.id,
    multiplier: 1 / connection.multiplier,
  })

  if (source.networkId !== target.networkId) {
    const sourceNetwork =
      context.world.networks[source.networkId]
    invariant(sourceNetwork)
    const targetNetwork =
      context.world.networks[target.networkId]
    invariant(targetNetwork)

    sourceNetwork.mass += targetNetwork.mass

    source.velocity +=
      target.velocity *
      Math.sqrt(targetNetwork.mass / sourceNetwork.mass)

    for (const entityId of Object.keys(
      targetNetwork.entityIds,
    )) {
      const entity = context.world.entities[entityId]
      invariant(entity?.networkId === targetNetwork.id)
      entity.networkId = sourceNetwork.id
      invariant(!sourceNetwork.entityIds[entity.id])
      sourceNetwork.entityIds[entity.id] = true
    }

    delete context.world.networks[targetNetwork.id]

    propogateVelocity(source, context.world.entities)
  }

  resetGearAngles(context.world)

  incrementBuildVersion(context)
}

export function validateBuild(
  world: World,
  hand: BuildHand,
): void {
  invariant(hand.valid)

  // only one network is allowed for now
  invariant(Object.keys(hand.networks).length === 1)

  const network = Object.values(hand.networks).at(0)
  invariant(network)

  const root = hand.entities[network.rootId]
  invariant(root)

  // verify that all build entities are connected
  // TODO could allow disconnected graphs to be built
  // in the future, but this allows me to make some assumptions
  // and simplify
  //
  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    invariant(!seen.has(current))
    seen.add(current)

    for (const connection of current.connections) {
      let entity = hand.entities[connection.entityId]
      if (entity) {
        invariant(network.entityIds[entity.id])
        if (!seen.has(entity)) {
          stack.push(entity)
        }
      } else {
        entity = world.entities[connection.entityId]
        invariant(entity)
        invariant(!network.entityIds[entity.id])
      }
    }
  }
}

function addReverseConnections(
  world: World,
  hand: BuildHand,
  entity: Entity,
): void {
  // add connections to existing entities
  for (const connection of entity.connections) {
    let target = hand.entities[connection.entityId]
    if (target) {
      // double check there is a connection back
      invariant(
        target.connections.find(
          (c) => c.entityId === entity.id,
        ),
      )
      continue
    }
    target = world.entities[connection.entityId]
    invariant(target)

    // verify there is currently no connection
    invariant(
      !target.connections.find(
        (c) => c.entityId === entity.id,
      ),
    )

    target.connections.push({
      entityId: entity.id,
      multiplier: 1 / connection.multiplier,
      type: connection.type,
    })
  }
}
