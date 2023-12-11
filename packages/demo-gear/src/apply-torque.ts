import invariant from 'tiny-invariant'
import {
  Entity,
  EntityType,
  GearEntity,
  World,
} from './types.js'
import { getTotalMass } from './util.js'

export function getAccelerationMap(
  root: Entity,
  rootAcceleration: number,
  entities: World['entities'],
): Map<Entity, number> | null {
  const map = new Map<Entity, number>()
  map.set(root, rootAcceleration)

  const stack = new Array<Entity>(root)
  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    const tailMultiplier = map.get(tail)
    invariant(tailMultiplier !== undefined)

    for (const c of tail.connections) {
      const neighbor = entities[c.entityId]
      invariant(neighbor)

      const neighborMultiplier =
        tailMultiplier * c.multiplier

      if (map.has(neighbor)) {
        if (map.get(neighbor) !== neighborMultiplier) {
          return null
        }
        continue
      }

      map.set(neighbor, neighborMultiplier)
      stack.push(neighbor)
    }
  }

  return map
}

export function applyForce(
  root: GearEntity,
  force: number,
  elapsed: number,
  world: World,
): void {
  const m = getTotalMass(root, world)

  const I = (1 / 2) * m * root.radius ** 2
  invariant(I > 0)
  const rootAcceleration = (force * root.radius) / I

  const accelerationMap = getAccelerationMap(
    root,
    rootAcceleration,
    world.entities,
  )
  invariant(accelerationMap)

  for (const [
    entity,
    acceleration,
  ] of accelerationMap.entries()) {
    const dv = acceleration * elapsed
    switch (entity.type) {
      case EntityType.enum.Gear: {
        entity.velocity += dv / entity.radius
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        entity.velocity += dv
        break
      }
    }
  }
}

export function applyFriction(
  root: GearEntity,
  coeffecient: number,
  magnitude: number,
  elapsed: number,
  world: World,
): void {
  const force = coeffecient * root.velocity * -1 * magnitude
  return applyForce(root, force, elapsed, world)
}
