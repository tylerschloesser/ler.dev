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
): Map<Entity, number> | null {
  const forceMultiplierMap = new Map<Entity, number>()
  forceMultiplierMap.set(root, 1)

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
    gear,
    forceMultiplier,
  ] of forceMultiplierMap.entries()) {
    invariant(gear.type === EntityType.enum.Gear)

    const r = gear.radius
    const I = (1 / 2) * m * r ** 2
    const torque = force * forceMultiplier * gear.radius
    const acceleration = torque / I
    const dv = acceleration * elapsed

    const energyBefore = (1 / 2) * I * gear.velocity ** 2

    gear.velocity += dv

    const energyAfter = (1 / 2) * I * gear.velocity ** 2

    energyDiff += energyAfter - energyBefore
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
