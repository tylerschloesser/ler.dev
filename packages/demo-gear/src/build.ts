import invariant from 'tiny-invariant'
import { buildBelt } from './build-belt.js'
import { buildGear } from './build-gear.js'
import {
  Belt,
  BeltEntity,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityType,
  IAppContext,
  World,
} from './types.js'
import {
  getExternalNetworks,
  incrementBuildVersion,
  isBelt,
  mergeBuildEntities,
  propogateVelocity,
} from './util.js'

export function build(
  context: IAppContext,
  hand: BuildHand,
): void {
  validateBuild(context, hand)

  // assumption: all entities are connected (i.e. within the same network)

  mergeBuildEntities(context, hand)

  const root = Object.values(hand.entities).at(0)
  invariant(root)

  const newNetwork = Object.values(hand.networks).at(0)
  invariant(newNetwork)
  context.world.networks[newNetwork.id] = newNetwork

  const externalNetworks = getExternalNetworks(
    context,
    hand,
    root,
  )

  let momentum = [root.velocity * newNetwork.mass]

  for (const [networkId, value] of Object.entries(
    externalNetworks,
  )) {
    const network = context.world.networks[networkId]
    invariant(network)

    newNetwork.mass += network.mass

    const velocity =
      value.incomingVelocity * value.multiplier

    momentum.push(network.mass * velocity)

    for (const entityId of Object.keys(network.entityIds)) {
      const entity = context.world.entities[entityId]
      invariant(entity?.networkId === network.id)
      entity.networkId = newNetwork.id
      invariant(!newNetwork.entityIds[entity.id])
      newNetwork.entityIds[entity.id] = true
    }

    delete context.world.networks[networkId]
  }

  root.velocity =
    momentum.reduce((a, m) => a + m, 0) / newNetwork.mass

  context.world.networks[newNetwork.id] = newNetwork

  for (const entity of Object.values(hand.entities)) {
    // must happen first because of gear logic atm
    addReverseConnections(context, hand, entity)

    switch (entity.type) {
      case EntityType.enum.Gear: {
        buildGear(context, entity)
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        buildBelt(context, entity)
        break
      }
      default: {
        invariant(false, 'TODO')
      }
    }
  }

  propogateVelocity(root, context.world.entities)

  // TODO be smarter about this
  resetGearAngles(context)

  resetBeltOffsets(context.world, hand)

  hand.entities = {}
  incrementBuildVersion(context)
}

function resetBeltOffsets(world: World, hand: BuildHand) {
  const seen = new Set<Belt>()

  for (const root of Object.values(hand.entities)) {
    invariant(world.entities[root.id] === root)

    if (
      (root.type !== EntityType.enum.Belt &&
        root.type !== EntityType.enum.BeltIntersection) ||
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

function resetGearAngles(context: IAppContext): void {
  for (const entity of Object.values(
    context.world.entities,
  )) {
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

  resetGearAngles(context)

  incrementBuildVersion(context)
}

export function validateBuild(
  context: IAppContext,
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
        entity = context.world.entities[connection.entityId]
        invariant(entity)
        invariant(!network.entityIds[entity.id])
      }
    }
  }
}

function addReverseConnections(
  context: IAppContext,
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
    target = context.world.entities[connection.entityId]
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
