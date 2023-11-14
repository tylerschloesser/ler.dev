import invariant from 'tiny-invariant'
import { getConnections } from './get-connections.js'
import {
  ConnectionType,
  Gear,
  Vec2,
  World,
} from './types.js'
import { getEnergy, getNetwork } from './util.js'

export function addGear({
  size,
  position,
  chain,
  world,
}: {
  size: number
  position: Vec2
  chain?: Gear
  world: World
}): void {
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}`
  invariant(world.gears[gearId] === undefined)

  const connections = getConnections({
    size,
    position,
    world,
  })

  let sign = 0
  if (connections.length > 0) {
    const neighbors = connections.map((connection) => {
      const neighbor = world.gears[connection.gearId]
      invariant(neighbor)
      return neighbor
    })

    const [first, ...rest] = neighbors
    invariant(first)

    // sign is the opposite of the neighbor
    sign = Math.sign(first.velocity) * -1

    for (const neighbor of rest) {
      invariant(sign === Math.sign(neighbor.velocity) * -1)
    }

    neighbors.forEach((neighbor) => {
      neighbor.connections.push({
        type: ConnectionType.Direct,
        gearId,
      })
    })
  }

  if (chain) {
    // TODO
    invariant(connections.length === 0)

    sign = Math.sign(chain.velocity)

    connections.push({
      gearId: chain.id,
      type: ConnectionType.Chain,
    })

    chain.connections.push({
      gearId,
      type: ConnectionType.Chain,
    })
  }

  const mass = Math.PI * size ** 2
  const radius = size / 2

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    radius,
    mass,
    angle: 0,
    velocity: 0,
    connections,
  }

  world.gears[gear.id] = gear

  for (
    let x = -((size - 1) / 2);
    x <= (size - 1) / 2;
    x++
  ) {
    for (
      let y = -((size - 1) / 2);
      y <= (size - 1) / 2;
      y++
    ) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))

      const tileId = `${position.x + x}.${position.y + y}`
      invariant(world.tiles[tileId] === undefined)

      world.tiles[tileId] = { gearId }
    }
  }

  const network = getNetwork(gear, world.gears)
  const energy = getEnergy(network)

  const root = gear
  let sum = 0
  for (const node of network) {
    sum += (1 / 4) * node.mass * root.radius ** 2
  }
  root.velocity = sign * Math.sqrt(energy / sum)

  for (const node of network) {
    node.velocity =
      Math.sign(node.velocity) *
      (root.radius / node.radius) *
      Math.abs(root.velocity)
  }
}
