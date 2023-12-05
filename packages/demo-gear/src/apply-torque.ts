import invariant from 'tiny-invariant'
import {
  ConnectionType,
  Gear,
  PartialGear,
  World,
} from './types.js'
import { getTotalMass } from './util.js'

export function getTorqueMultiplierMap(
  root: PartialGear,
  world: World,
): Map<PartialGear, number> | null {
  const torqueMultiplierMap = new Map<PartialGear, number>()
  torqueMultiplierMap.set(root, 1)

  const stack = new Array<PartialGear>(root)
  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    const tailMultiplier = torqueMultiplierMap.get(tail)
    invariant(tailMultiplier !== undefined)

    for (const c of tail.connections) {
      invariant(
        c.type !== ConnectionType.enum.Belt,
        'TODO support belt connections',
      )
      const neighbor = world.gears[c.gearId]
      invariant(neighbor)

      const neighborMultiplier =
        tailMultiplier * c.multiplier

      if (torqueMultiplierMap.has(neighbor)) {
        if (
          torqueMultiplierMap.get(neighbor) !==
          neighborMultiplier
        ) {
          return null
        }
        continue
      }

      torqueMultiplierMap.set(neighbor, neighborMultiplier)
      stack.push(neighbor)
    }
  }

  return torqueMultiplierMap
}

function applyTorque(
  root: Gear,
  rootTorque: number,
  elapsed: number,
  world: World,
): number {
  const m = getTotalMass(root, world)
  const torqueMultiplierMap = getTorqueMultiplierMap(
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
  root: Gear,
  force: number,
  elapsed: number,
  world: World,
): number {
  const rootTorque = force * root.radius
  return applyTorque(root, rootTorque, elapsed, world)
}

export function applyFriction(
  root: Gear,
  coeffecient: number,
  magnitude: number,
  elapsed: number,
  world: World,
): number {
  const rootTorque =
    coeffecient * root.velocity * -1 * magnitude
  return applyTorque(root, rootTorque, elapsed, world)
}
