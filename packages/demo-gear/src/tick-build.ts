import invariant from 'tiny-invariant'
import { TWO_PI } from './const.js'
import {
  Belt,
  BeltEntity,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityType,
  Gear,
  IAppContext,
} from './types.js'
import { mod } from './util.js'

export function tickBuild(
  context: IAppContext,
  hand: BuildHand,
  elapsed: number,
): void {
  if (!hand.valid) return
  const first = getFirstExternalConnection(context, hand)
  if (!first) return
  const { root, external, connection } = first

  // TODO get all incoming connections and if they're equal,
  // update the velocities, otherwise set velocities to zero

  const seen = new Set<Entity>()
  const stack = new Array<{
    entity: Entity
    multiplier: number
  }>({
    entity: root,
    multiplier: connection.multiplier,
  })

  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    const { entity, multiplier } = current
    invariant(!seen.has(entity))
    seen.add(entity)
    entity.velocity = external.velocity * multiplier

    for (const c of entity.connections) {
      if (!hand.entities[c.entityId]) continue
      const neighbor = hand.entities[c.entityId]
      invariant(neighbor)
      if (!seen.has(neighbor)) {
        stack.push({
          entity: neighbor,
          multiplier: multiplier * c.multiplier,
        })
      }
    }
  }

  // for (const entity of Object.values(hand.entities)) {
  //   switch (entity.type) {
  //     case EntityType.enum.Gear: {
  //       tickBuildGear(context, hand, entity)
  //       break
  //     }
  //     case EntityType.enum.Belt: {
  //       tickBuildBelt(context, hand, entity, elapsed)
  //       break
  //     }
  //   }
  // }
}

// prioritize setting angle based on the chain
// because chain gears require identical angles
function getPrioritizedGearConnection(
  gear: Gear,
): Connection | null {
  let other: Connection | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Chain) {
      return connection
    } else if (other === null) {
      other = connection
    }
  }
  return other
}

function tickBuildGear(
  context: IAppContext,
  hand: BuildHand,
  gear: Gear,
): void {
  let connection = getPrioritizedGearConnection(gear)
  if (hand.valid && connection) {
    invariant(
      connection.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )

    // if valid, we can check any connected gear to get the angle
    const neighbor =
      context.world.entities[connection.entityId]
    invariant(neighbor?.type === EntityType.enum.Gear)

    switch (connection.type) {
      case ConnectionType.enum.Attach:
      case ConnectionType.enum.Chain:
        gear.angle = neighbor.angle
        break
      case ConnectionType.enum.Adjacent:
        gear.angle =
          (TWO_PI - neighbor.angle) *
          (neighbor.radius / gear.radius)
        break
    }
  } else {
    gear.angle = 0
  }
}

function getFirstExternalConnection(
  context: IAppContext,
  hand: BuildHand,
): {
  external: Entity
  root: Entity
  connection: Connection
} | null {
  invariant(hand.valid)

  const root = Object.values(hand.entities).at(0)
  invariant(root)

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    invariant(!seen.has(current))
    seen.add(current)

    for (const connection of current.connections) {
      let entity =
        context.world.entities[connection.entityId]
      if (entity) {
        invariant(!hand.entities[entity.id])
        return { root, external: entity, connection }
      }
      entity = hand.entities[connection.entityId]
      invariant(entity)
      if (!seen.has(entity)) {
        stack.push(entity)
      }
    }
  }

  return null
}

function getFirstAdjacentGear(
  context: IAppContext,
  hand: BuildHand,
  root: BeltEntity,
): {
  gear: Gear
  multiplier: number
} | null {
  const seen = new Set<Belt>()
  const stack = new Array<{
    belt: Belt
    multiplier: number
  }>({
    belt: root,
    multiplier: 1,
  })

  while (stack.length) {
    const current = stack.pop()
    invariant(current)

    seen.add(current.belt)

    for (const connection of current.belt.connections) {
      // first try to get the entity from the existing world, then the current build
      const entity =
        context.world.entities[connection.entityId] ??
        hand.entities[connection.entityId]
      switch (connection.type) {
        case ConnectionType.enum.Adjacent: {
          invariant(entity?.type === EntityType.enum.Gear)
          return {
            gear: entity,
            multiplier:
              current.multiplier * connection.multiplier,
          }
        }
        case ConnectionType.enum.Belt: {
          invariant(
            entity?.type === EntityType.enum.Belt ||
              entity?.type ===
                EntityType.enum.BeltIntersection,
          )
          if (!seen.has(entity)) {
            stack.push({
              belt: entity,
              multiplier:
                current.multiplier * connection.multiplier,
            })
          }
          break
        }
        default: {
          invariant(false)
        }
      }
    }
  }

  return null
}

function tickBuildBelt(
  context: IAppContext,
  hand: BuildHand,
  belt: BeltEntity,
  elapsed: number,
): void {
  if (!hand.valid) {
    return
  }
  const first = getFirstAdjacentGear(context, hand, belt)
  if (first === null) {
    return
  }
  const { gear, multiplier } = first

  const velocity = gear.velocity * gear.radius * multiplier
  belt.offset = mod(belt.offset + velocity * elapsed, 1)
}
