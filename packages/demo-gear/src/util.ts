import invariant from 'tiny-invariant'
import { Gear, GearId, Network } from './types.js'

export function* iterateNetwork(root: Gear, gears: Record<GearId, Gear>) {
  const seen = new Set<Gear>()
  const stack = new Array<{ gear: Gear; sign: number }>({
    gear: root,
    sign: Math.sign(root.velocity),
  })

  while (stack.length) {
    const node = stack.pop()
    invariant(node)
    if (seen.has(node.gear)) {
      continue
    }
    seen.add(node.gear)

    yield node

    const { connections } = node.gear
    invariant(connections.size === 0 || connections.size === 1)

    connections.forEach((id) => {
      const neighbor = gears[id]
      invariant(neighbor)
      stack.push({
        gear: neighbor,
        sign: node.sign * -1,
      })
    })
  }
}

export function getNetwork(root: Gear, gears: Record<GearId, Gear>): Network {
  const network = new Set<Gear>()

  const stack = new Array<Gear>(root)
  while (stack.length) {
    const gear = stack.pop()
    invariant(gear)
    if (network.has(gear)) {
      continue
    }

    network.add(gear)

    for (const neighborId of gear.connections) {
      const neighbor = gears[neighborId]
      invariant(neighbor)
      stack.push(neighbor)
    }
  }

  return network
}

export function getNetworks(gears: Record<GearId, Gear>): Network[] {
  const networks = new Array<Network>()

  const seen = new Set<Gear>()
  for (const root of Object.values(gears)) {
    if (seen.has(root)) {
      continue
    }
    const network = getNetwork(root, gears)
    network.forEach((node) => seen.add(node))
    networks.push(network)
  }

  return networks
}
