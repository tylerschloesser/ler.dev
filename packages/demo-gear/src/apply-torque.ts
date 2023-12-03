import invariant from 'tiny-invariant'
import { ConnectionType, Gear, World } from './types.js'
import { getTotalMass } from './util.js'

function getTorqueMultiplierMap(
  root: Gear,
  world: World,
): Map<Gear, number> {
  const torqueMultiplierMap = new Map<Gear, number>()
  torqueMultiplierMap.set(root, 1)

  const stack = new Array<Gear>(root)
  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    const tailMultiplier = torqueMultiplierMap.get(tail)
    invariant(tailMultiplier !== undefined)

    for (const c of tail.connections) {
      const neighbor = world.gears[c.gearId]
      invariant(neighbor)

      if (torqueMultiplierMap.has(neighbor)) {
        continue
      }

      let neighborMultiplier: number
      switch (c.type) {
        case ConnectionType.enum.Adjacent:
          neighborMultiplier =
            tailMultiplier *
            (neighbor.radius / tail.radius) *
            -1
          break
        case ConnectionType.enum.Attach:
          neighborMultiplier =
            tailMultiplier *
            (neighbor.radius / tail.radius) ** 2
          break
        case ConnectionType.enum.Chain:
          neighborMultiplier = tailMultiplier
          break
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