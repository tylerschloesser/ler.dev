import invariant from 'tiny-invariant'
import {
  ConnectionType,
  EntityType,
  GearEntity,
  World,
} from './types.js'
import { getTotalMass } from './util.js'

export function getForceMultiplierMap(
  root: GearEntity,
  world: World,
): Map<GearEntity, number> | null {
  const forceMultiplierMap = new Map<GearEntity, number>()
  forceMultiplierMap.set(root, 1)

  const stack = new Array<GearEntity>(root)
  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    const tailMultiplier = forceMultiplierMap.get(tail)
    invariant(tailMultiplier !== undefined)

    for (const c of tail.connections) {
      invariant(
        c.type !== ConnectionType.enum.Belt,
        'TODO support belt connections',
      )
      const neighbor = world.entities[c.entityId]
      invariant(neighbor?.type === EntityType.enum.Gear)

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

function applyTorque(
  root: GearEntity,
  rootTorque: number,
  elapsed: number,
  world: World,
): number {
  const m = getTotalMass(root, world)
  const torqueMultiplierMap = getForceMultiplierMap(
    root,
    world,
  )
  invariant(torqueMultiplierMap)

  let energyDiff = 0

  for (const [
    gear,
    torqueMultiplier,
  ] of torqueMultiplierMap.entries()) {
    const r = gear.radius
    const I = (1 / 2) * m * r ** 2
    const torque = rootTorque * torqueMultiplier
    const acceleration = torque / I
    const dv = acceleration * elapsed

    const energyBefore = (1 / 2) * I * gear.velocity ** 2

    gear.velocity += dv

    const energyAfter = (1 / 2) * I * gear.velocity ** 2

    energyDiff += energyAfter - energyBefore
  }

  return energyDiff
}

export function applyForce(
  root: GearEntity,
  force: number,
  elapsed: number,
  world: World,
): number {
  const rootTorque = force * root.radius
  return applyTorque(root, rootTorque, elapsed, world)
}

export function applyFriction(
  root: GearEntity,
  coeffecient: number,
  magnitude: number,
  elapsed: number,
  world: World,
): number {
  const rootTorque =
    coeffecient * root.velocity * -1 * magnitude
  return applyTorque(root, rootTorque, elapsed, world)
}
