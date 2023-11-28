import invariant from 'tiny-invariant'
import {
  ACCELERATION,
  FRICTION,
  TICK_DURATION,
  TWO_PI,
} from './const.js'
import {
  ConnectionType,
  Gear,
  HandType,
  InitFn,
  PartialGear,
  World,
} from './types.js'

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
      hand?.type === HandType.Accelerate &&
      hand.active &&
      hand.gear
    ) {
      accelerateGear({
        root: hand.gear,
        acceleration: hand.direction * ACCELERATION,
        elapsed,
        world,
      })
    }

    if (FRICTION !== 0) {
      applyFriction({ elapsed, world })
    }

    for (const gear of Object.values(world.gears)) {
      gear.angle =
        (gear.angle + gear.velocity * elapsed + TWO_PI) %
        TWO_PI
    }

    if (state.hand?.type === HandType.Build) {
      const { hand } = state
      hand.angle =
        (hand.angle + hand.velocity * elapsed + TWO_PI) %
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
  const seen = new Set<PartialGear>()
  function recurse(
    from: PartialGear | null,
    to: PartialGear,
    type: ConnectionType | null,
  ): boolean {
    if (from) {
      invariant(type)
      let n
      switch (type) {
        case ConnectionType.enum.Adjacent:
          n = (from.radius / to.radius) * -1
          break
        case ConnectionType.enum.Chain:
          n = from.radius / to.radius
          break
        case ConnectionType.enum.Attach:
          n = 1
      }

      if (seen.has(to)) {
        const diff = to.velocity - from.velocity * n
        return Math.abs(diff) < Number.EPSILON * 1e2
      }
    }
    seen.add(to)

    for (const connection of to.connections) {
      const toto = world.gears[connection.gearId]
      invariant(toto)
      if (!recurse(to, toto, connection.type)) {
        return false
      }
    }

    return true
  }

  return recurse(null, root, null)
}

function accelerateGear({
  root,
  acceleration,
  elapsed,
  world,
}: {
  root: Gear
  acceleration: number
  elapsed: number
  world: World
}): void {
  root.velocity += acceleration * elapsed

  const seen = new Set<Gear>()
  function recurse({
    from,
    to,
    type,
  }: {
    from: Gear
    to: Gear
    type: ConnectionType
  }): void {
    // TODO this is duplicated in build
    let n
    switch (type) {
      case ConnectionType.enum.Adjacent:
        n = (from.radius / to.radius) * -1
        break
      case ConnectionType.enum.Chain:
        n = from.radius / to.radius
        break
      case ConnectionType.enum.Attach:
        n = 1
    }

    if (seen.has(to)) {
      const diff = to.velocity - from.velocity * n
      invariant(Math.abs(diff) < Number.EPSILON * 1e2)
      return
    }
    seen.add(to)

    to.velocity = from.velocity * n

    for (const connection of to.connections) {
      const toto = world.gears[connection.gearId]
      invariant(toto)
      recurse({
        from: to,
        to: toto,
        type: connection.type,
      })
    }
  }

  for (const connection of root.connections) {
    const to = world.gears[connection.gearId]
    invariant(to)
    recurse({
      from: root,
      to,
      type: connection.type,
    })
  }
}

function applyFriction({
  elapsed,
  world,
}: {
  elapsed: number
  world: World
}): void {
  const seen = new Set<Gear>()

  for (const root of Object.values(world.gears)) {
    if (seen.has(root)) {
      // TODO validate?
      continue
    }

    let energy = 0
    let sum = 0
    const nmap = new Map<Gear, number>()

    {
      const stack = new Array<{ gear: Gear; n: number }>({
        gear: root,
        n: 1,
      })
      while (stack.length) {
        const { gear, n } = stack.pop()!

        if (seen.has(gear)) {
          // TODO validate?
          continue
        }
        seen.add(gear)
        nmap.set(gear, n)

        sum += gear.radius ** 2 * gear.mass * n ** -2

        energy +=
          (1 / 4) *
          gear.radius ** 2 *
          gear.velocity ** 2 *
          gear.mass

        for (const connection of gear.connections) {
          const peer = world.gears[connection.gearId]
          invariant(peer)

          stack.push({
            gear: peer,
            n:
              n *
              (() => {
                switch (connection.type) {
                  case ConnectionType.enum.Adjacent:
                    return (peer.radius / gear.radius) * -1
                  case ConnectionType.enum.Chain:
                    return peer.radius / gear.radius
                  case ConnectionType.enum.Attach:
                    return 1
                }
              })(),
          })
        }
      }
    }

    // TODO set to 0 at some point
    energy -= energy * FRICTION * elapsed

    root.velocity =
      Math.sign(root.velocity) *
      Math.sqrt((4 * energy) / sum)
    propogateRootVelocity({ root, nmap, world })
  }
}

function propogateRootVelocity({
  root,
  nmap,
  world,
}: {
  root: Gear
  nmap: Map<Gear, number>
  world: World
}): void {
  const seen = new Set<Gear>()
  const stack = new Array<Gear>(root)
  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)

    if (seen.has(gear)) {
      continue
    }
    seen.add(gear)

    const n = nmap.get(gear)
    invariant(n !== undefined)
    gear.velocity = root.velocity * n ** -1

    for (const connection of gear.connections) {
      const peer = world.gears[connection.gearId]
      invariant(peer)
      stack.push(peer)
    }
  }
}
