import invariant from 'tiny-invariant'
import { getEnergy } from './energy.js'
import { propogateRootVelocity } from './init-simulator.js'
import {
  AppState,
  ConnectionType,
  Gear,
  PartialGear,
} from './types.js'
import { iterateGearTileIds } from './util.js'

export function addChainConnection(
  gear1: Gear,
  gear2: Gear,
  _state: AppState,
): void {
  // TODO validate
  gear1.connections.push({
    type: ConnectionType.enum.Chain,
    gearId: gear2.id,
  })
  gear2.connections.push({
    type: ConnectionType.enum.Chain,
    gearId: gear1.id,
  })
}

export function addGear(
  partial: PartialGear,
  _chain: Gear | null, // TODO remove this
  attach: Gear | null,
  state: AppState,
): void {
  const { world } = state

  const { position, radius, connections, angle, velocity } =
    partial

  const gearId = `${position.x}.${position.y}.${radius}`
  invariant(world.gears[gearId] === undefined)

  for (const connection of connections) {
    // add the a connection in the other direction
    const node = world.gears[connection.gearId]
    invariant(node)
    node.connections.push({
      type: connection.type,
      gearId,
    })
  }

  const mass = Math.PI * radius ** 2

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    radius,
    mass,
    angle,
    velocity,
    connections,
  }

  world.gears[gear.id] = gear

  for (const tileId of iterateGearTileIds(
    position,
    radius,
  )) {
    let tile = world.tiles[tileId]

    if (attach) {
      invariant(tile?.gearId)
      invariant(tile?.attachedGearId === undefined)
      tile.attachedGearId = gearId
    } else {
      invariant(tile === undefined)
      tile = world.tiles[tileId] = { gearId }
    }
  }

  distributeEnergy(state, gear)
}

function distributeEnergy(
  state: AppState,
  root: Gear,
): void {
  type Network = { energy: number; members: Set<Gear> }

  const networks = new Map<Gear, Network>()

  {
    const stack = new Array<Gear>(root)
    while (stack.length) {
      const cur = stack.pop()
      invariant(cur)

      let prev: Network | undefined
      if (cur !== root) {
        prev = networks.get(cur)
        invariant(prev)
      }

      for (const connection of cur.connections) {
        const peer = state.world.gears[connection.gearId]
        invariant(peer)

        if (peer === root) {
          continue
        }

        let next = networks.get(peer)
        if (!next) {
          next = {
            energy: getEnergy(peer),
            members: new Set([peer]),
          }
          networks.set(peer, next)
          stack.push(peer)
        }

        if (prev && prev !== next) {
          prev.energy += next.energy
          for (const member of next.members) {
            prev.members.add(member)
            invariant(networks.get(member) === next)
            networks.set(member, prev)
          }
        }
      }
    }
  }

  let finalEnergy = 0

  {
    const seen = new Set<Network>()
    for (const connection of root.connections) {
      const peer = state.world.gears[connection.gearId]
      invariant(peer)

      const network = networks.get(peer)
      invariant(network)

      if (seen.has(network)) {
        // if the root is connected to the same network twice,
        // it means there's a loop. Simply only look at the first
        // one. The loop means that things should be spinning
        // in the correct direction.
        continue
      }
      seen.add(network)

      let sign: number
      switch (connection.type) {
        case ConnectionType.enum.Adjacent:
          sign = -1
          break
        case ConnectionType.enum.Attach:
          sign = 1
          break
        case ConnectionType.enum.Chain:
          sign = 1
          break
      }

      finalEnergy +=
        sign * Math.sign(peer.velocity) * network.energy

      console.log({
        velocity: peer.velocity,
        energy: network.energy,
        type: connection.type,
      })
    }
  }

  console.log('finalEnergy', finalEnergy)

  {
    const nmap = new Map<Gear, number>()
    const stack = new Array<Gear>(root)
    nmap.set(root, 1)
    let sum = 0

    while (stack.length) {
      const gear = stack.pop()
      invariant(gear)

      const np = nmap.get(gear)
      invariant(np)

      sum += gear.radius ** 2 * gear.mass * np ** -2

      for (const connection of gear.connections) {
        const peer = state.world.gears[connection.gearId]
        invariant(peer)

        let n: number
        switch (connection.type) {
          case ConnectionType.enum.Adjacent:
            n = (peer.radius / gear.radius) * -1
            break
          case ConnectionType.enum.Chain:
            n = peer.radius / gear.radius
            break
          case ConnectionType.enum.Attach:
            n = 1
            break
        }

        n = n * np

        let prev = nmap.get(peer)
        if (prev !== undefined) {
          invariant(n === prev)
        } else {
          nmap.set(peer, n)
          stack.push(peer)
        }
      }
    }

    invariant(sum !== 0)
    root.velocity =
      Math.sign(finalEnergy) *
      Math.sqrt((4 * Math.abs(finalEnergy)) / sum)
    root.angle = 0

    invariant(!Number.isNaN(root.velocity))

    propogateRootVelocity({
      root,
      nmap,
      world: state.world,
      resetAngle: true,
    })
  }
}
