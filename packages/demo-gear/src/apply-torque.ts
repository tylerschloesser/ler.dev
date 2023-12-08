import invariant from 'tiny-invariant'
import {
  Entity,
  EntityType,
  GearEntity,
  World,
} from './types.js'
import { getTotalMass } from './util.js'

export function getForceMultiplierMap(
  root: Entity,
  entities: World['entities'],
  rootMultiplier: number = 1,
): Map<Entity, number> | null {
  const forceMultiplierMap = new Map<Entity, number>()
  forceMultiplierMap.set(root, rootMultiplier)

  const stack = new Array<Entity>(root)
  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    const tailMultiplier = forceMultiplierMap.get(tail)
    invariant(tailMultiplier !== undefined)

    for (const c of tail.connections) {
      const neighbor = entities[c.entityId]
      invariant(neighbor)

      const neighborMultiplier =
        tailMultiplier * c.multiplier

      if (forceMultiplierMap.has(neighbor)) {
        if (
          forceMultiplierMap.get(neighbor) !==
          neighborMultiplier
        ) {
          return null
        }
        continue
      }

      forceMultiplierMap.set(neighbor, neighborMultiplier)
      stack.push(neighbor)
    }
  }

  return forceMultiplierMap
}

export function applyForce(
  root: GearEntity,
  force: number,
  elapsed: number,
  world: World,
): number {
  const m = getTotalMass(root, world)
  const forceMultiplierMap = getForceMultiplierMap(
    root,
    world.entities,
  )
  invariant(forceMultiplierMap)

  let energyDiff = 0

  for (const [
    entity,
    forceMultiplier,
  ] of forceMultiplierMap.entries()) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        const r = entity.radius
        const I = (1 / 2) * m * r ** 2
        const torque =
          force * forceMultiplier * entity.radius
        const acceleration = torque / I
        const dv = acceleration * elapsed

        const energyBefore =
          (1 / 2) * I * entity.velocity ** 2

        entity.velocity += dv

        const energyAfter =
          (1 / 2) * I * entity.velocity ** 2

        energyDiff += energyAfter - energyBefore
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        const acceleration =
          (force * forceMultiplier) / entity.mass
        const dv = acceleration * elapsed
        entity.velocity += dv

        // TODO update energy diff?

        break
      }
      default: {
        invariant(false)
      }
    }
  }

  return energyDiff
}

export function applyFriction(
  root: GearEntity,
  coeffecient: number,
  magnitude: number,
  elapsed: number,
  world: World,
): number {
  const force = coeffecient * root.velocity * -1 * magnitude
  return applyForce(root, force, elapsed, world)
}
