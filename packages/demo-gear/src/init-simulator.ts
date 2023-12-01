import invariant from 'tiny-invariant'
import { TICK_DURATION, TWO_PI } from './const.js'
import {
  ConnectionType,
  Gear,
  HandType,
  InitFn,
  PartialGear,
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
    if (
      hand?.type === HandType.ApplyForce &&
      hand.active &&
      hand.gear
    ) {
      applyForce(
        hand.gear,
        (hand.direction === 'ccw' ? -1 : 1) *
          hand.magnitude,
        elapsed,
        world,
      )
    }

    switch (hand?.type) {
      case HandType.ApplyForce: {
        if (hand.active && hand.gear) {
          const force =
            (hand.direction === 'ccw' ? -1 : 1) *
            hand.magnitude
          applyForce(hand.gear, force, elapsed, world)
        }
        break
      }
      case HandType.ApplyFriction: {
        if (hand.active && hand.gear) {
          applyFriction(
            hand.gear,
            hand.coeffecient,
            elapsed,
            world,
          )
        }
        break
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

export function isNetworkValid(
  root: PartialGear,
  world: World,
): boolean {
  const nmap = new Map<PartialGear, number>()
  const stack = new Array<PartialGear>(root)
  nmap.set(root, 1)

  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)

    const np = nmap.get(gear)
    invariant(np)

    for (const connection of gear.connections) {
      const peer = world.gears[connection.gearId]
      invariant(peer)

      let n: number
      switch (connection.type) {
        case ConnectionType.enum.Adjacent:
          n = (gear.radius / peer.radius) * -1
          break
        case ConnectionType.enum.Chain:
          n = gear.radius / peer.radius
          break
        case ConnectionType.enum.Attach:
          n = 1
          break
      }

      n = n * np

      let prev = nmap.get(peer)
      if (prev !== undefined) {
        if (n !== prev) {
          return false
        }
      } else {
        nmap.set(peer, n)
        stack.push(peer)
      }
    }
  }

  return true
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
): void {
  const m = getTotalMass(root, world)
  const torqueMultiplierMap = getTorqueMultiplierMap(
    root,
    world,
  )

  for (const [
    gear,
    torqueMultiplier,
  ] of torqueMultiplierMap.entries()) {
    const r = gear.radius
    const I = (1 / 2) * m * r ** 2
    const torque = rootTorque * torqueMultiplier
    const acceleration = torque / I
    const dv = acceleration * elapsed
    gear.velocity += dv
  }
}

function applyForce(
  root: Gear,
  force: number,
  elapsed: number,
  world: World,
): void {
  const rootTorque = force * root.radius
  applyTorque(root, rootTorque, elapsed, world)
}

function applyFriction(
  root: Gear,
  coeffecient: number,
  elapsed: number,
  world: World,
): void {
  const opposingForce = 100
  const rootTorque =
    coeffecient * root.velocity * -1 * opposingForce
  applyTorque(root, rootTorque, elapsed, world)
}
