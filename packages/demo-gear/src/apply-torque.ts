import invariant from 'tiny-invariant'
import { Entity, GearEntity, World } from './types.js'
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

      const existingMultiplier = map.get(neighbor)
      if (existingMultiplier !== undefined) {
        const diff = existingMultiplier - neighborMultiplier
        if (Math.abs(diff) > Number.EPSILON) {
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
  world: World,
  root: GearEntity,
  force: number,
  elapsed: number,
): void {
  const m = getTotalMass(root, world)

  const rootAcceleration = force / m

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

    entity.velocity += dv
  }
}

export function applyFriction(
  world: World,
  root: GearEntity,
  coeffecient: number,
  magnitude: number,
  elapsed: number,
): void {
  const force = coeffecient * root.velocity * -1 * magnitude
  return applyForce(world, root, force, elapsed)
}
