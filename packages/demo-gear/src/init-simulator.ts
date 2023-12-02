import invariant from 'tiny-invariant'
import { TICK_DURATION, TWO_PI } from './const.js'
import {
  ConnectionType,
  Gear,
  GearBehaviorType,
  HandType,
  InitFn,
  World,
} from './types.js'
import { getTotalMass } from './util.js'

export const initSimulator: InitFn = async (state) => {
  let prev: number = performance.now()
  function tick() {
    const { world } = state
    const now = performance.now()

    // cap the tick at 2x the duration
    // elapsed will likely be > TICK_DURATION because
    // of setInterval accuracy
    //
    if (now - prev > TICK_DURATION * 2) {
      prev = now - TICK_DURATION * 2
    }

    const elapsed = (now - prev) / 1000
    prev = now

    const { hand } = state
    switch (hand?.type) {
      case HandType.ApplyForce: {
        if (hand.active && hand.gear) {
          const force =
            (hand.direction === 'ccw' ? -1 : 1) *
            hand.magnitude
          hand.runningEnergyDiff += applyForce(
            hand.gear,
            force,
            elapsed,
            world,
          )
        }
        break
      }
      case HandType.ApplyFriction: {
        if (hand.active && hand.gear) {
          hand.runningEnergyDiff += applyFriction(
            hand.gear,
            hand.coeffecient,
            100, // TODO
            elapsed,
            world,
          )
        }
        break
      }
    }

    for (const gear of Object.values(world.gears)) {
      switch (gear.behavior?.type) {
        case GearBehaviorType.enum.Force: {
          const { behavior } = gear
          applyForce(
            gear,
            (behavior.direction === 'ccw' ? -1 : 1) *
              behavior.magnitude,
            elapsed,
            world,
          )
          break
        }
        case GearBehaviorType.enum.Friction: {
          const { behavior } = gear
          applyFriction(
            gear,
            behavior.coeffecient,
            behavior.magnitude,
            elapsed,
            world,
          )
          break
        }
      }
    }

    for (const gear of Object.values(world.gears)) {
      gear.angle =
        (gear.angle + gear.velocity * elapsed + TWO_PI) %
        TWO_PI
    }

    if (
      state.hand?.type === HandType.Build &&
      state.hand.gear
    ) {
      const { gear } = state.hand
      gear.angle =
        (gear.angle + gear.velocity * elapsed + TWO_PI) %
        TWO_PI
    }
  }

  const interval = self.setInterval(() => {
    try {
      tick()
    } catch (e) {
      console.error(e)
      self.clearInterval(interval)
      self.alert('Gears broke ☹️. Refresh to try again...')
    }
  }, TICK_DURATION)

  state.signal.addEventListener('abort', () => {
    self.clearInterval(interval)
  })
}

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

function applyForce(
  root: Gear,
  force: number,
  elapsed: number,
  world: World,
): number {
  const rootTorque = force * root.radius
  return applyTorque(root, rootTorque, elapsed, world)
}

function applyFriction(
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
