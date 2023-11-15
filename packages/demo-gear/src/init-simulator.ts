import invariant from 'tiny-invariant'
import {
  ACCELERATION,
  FRICTION,
  TICK_DURATION,
} from './const.js'
import {
  ConnectionType,
  Gear,
  InitSimulatorFn,
  Network,
  PointerType,
  World,
} from './types.js'
import {
  getEnergy,
  getNetworks,
  iterateNetwork,
} from './util.js'

export const initSimulator: InitSimulatorFn = ({
  pointer,
  world,
  signal,
}) => {
  let prev: number = performance.now()
  function tick() {
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

    if (
      pointer.current.type === PointerType.ApplyForce &&
      pointer.current.state?.active &&
      pointer.current.state.gearId
    ) {
      const gear = world.gears[pointer.current.state.gearId]
      invariant(gear)
      accelerateGear({
        root: gear,
        acceleration:
          pointer.current.acceleration * ACCELERATION,
        elapsed,
        world,
      })
    }

    const networks = getNetworks(world.gears)
    for (const network of networks) {
      applyFriction({ network, elapsed })
    }

    for (const gear of Object.values(world.gears)) {
      gear.angle += gear.velocity * elapsed
    }
  }
  const interval = self.setInterval(tick, TICK_DURATION)

  signal.addEventListener('abort', () => {
    self.clearInterval(interval)
  })
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
    let n
    switch (type) {
      case ConnectionType.Teeth:
        n = (from.radius / to.radius) * -1
        break
      case ConnectionType.Chain:
        n = from.radius / to.radius
        break
      case ConnectionType.Attached:
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
  network,
  elapsed,
}: {
  network: Network
  elapsed: number
}): void {
  let energy = getEnergy(network)
  energy -= energy * FRICTION * elapsed

  const [root] = [...network]
  invariant(root)

  let sum = 0
  for (const node of network) {
    sum += (1 / 4) * node.mass * root.radius ** 2
  }
  root.velocity =
    Math.sign(root.velocity) * Math.sqrt(energy / sum)

  for (const node of network) {
    node.velocity =
      Math.sign(node.velocity) *
      (root.radius / node.radius) *
      Math.abs(root.velocity)
  }
}
