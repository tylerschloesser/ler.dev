import invariant from 'tiny-invariant'
import { buildBelt } from './build-belt.js'
import { buildGear, resetNetwork } from './build-gear.js'
import {
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityType,
  IAppContext,
  World,
} from './types.js'
import {
  getFirstExternalConnection,
  getTotalMass,
  incrementBuildVersion,
} from './util.js'

export function build(
  context: IAppContext,
  hand: BuildHand,
): void {
  validateBuild(context, hand)

  // assumption: all entities are connected (i.e. within the same network)

  const first = getFirstExternalConnection(context, hand)

  let totalMassBefore: number = 0
  for (const entity of Object.values(hand.entities)) {
    totalMassBefore += entity.mass
  }

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

  if (first) {
    const totalMassAfter = getTotalMass(
      first.external,
      context.world,
    )

    conserveEnergy(
      // TODO this needs to be the first external gear that
      // is moving (if any)
      first.external,
      context.world,
      totalMassBefore,
      totalMassAfter,
    )
  }

  hand.entities = {}
  incrementBuildVersion(context)
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

  // TODO conserve energy instead of lazily destroying it here
  resetNetwork(context, source)

  incrementBuildVersion(context)
}

export function validateBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  invariant(hand.valid)

  // must be at least one entity
  const root = Object.values(hand.entities).at(0)
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
      if (context.world.entities[connection.entityId]) {
        // this is a connection to an already built entity
        invariant(!hand.entities[connection.entityId])
        continue
      }

      const entity = hand.entities[connection.entityId]
      invariant(entity)

      if (!seen.has(entity)) {
        stack.push(entity)
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

function conserveEnergy(
  root: Entity,
  world: World,
  totalMassBefore: number,
  totalMassAfter: number,
): void {
  invariant(totalMassAfter >= totalMassBefore)

  if (totalMassAfter === totalMassBefore) {
    // optimization
    return
  }

  root.velocity =
    root.velocity * (totalMassBefore / totalMassAfter)

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    if (seen.has(tail)) {
      continue
    }
    seen.add(tail)

    for (const c of tail.connections) {
      const neighbor = world.entities[c.entityId]
      invariant(neighbor)
      neighbor.velocity = tail.velocity * c.multiplier
      stack.push(neighbor)
    }
  }
}
