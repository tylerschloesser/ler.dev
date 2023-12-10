import invariant from 'tiny-invariant'
import { isEntityName } from 'typescript'
import { buildBelt } from './build-belt.js'
import { buildGear } from './build-gear.js'
import {
  BuildHand,
  Entity,
  EntityType,
  IAppContext,
} from './types.js'
import { incrementBuildVersion } from './util.js'

export function build(
  context: IAppContext,
  hand: BuildHand,
): void {
  validateBuild(context, hand)

  // assumption: all entities are connected (i.e. within the same network)

  let totalMassBefore: number = 0
  for (const entity of Object.values(hand.entities)) {
    totalMassBefore += entity.mass
  }

  for (const entity of Object.values(hand.entities)) {
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
