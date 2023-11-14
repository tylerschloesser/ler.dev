import invariant from 'tiny-invariant'
import { getConnections } from './get-connections.js'
import {
  Connection,
  ConnectionType,
  Gear,
  Vec2,
  World,
} from './types.js'
import {
  getEnergy,
  getNetwork,
  iterateGearTileIds,
} from './util.js'

interface BaseAddGearArgs {
  size: number
  position: Vec2
  world: World
}

interface NormalAddGearArgs extends BaseAddGearArgs {
  connectionType: ConnectionType.Teeth
}

interface ChainAddGearArgs extends BaseAddGearArgs {
  connectionType: ConnectionType.Chain
  chain: Gear
}

interface AttachAddGearArgs extends BaseAddGearArgs {
  connectionType: ConnectionType.Attached
  attach: Gear
}

export type AddGearArgs =
  | NormalAddGearArgs
  | ChainAddGearArgs
  | AttachAddGearArgs

export function addGear(args: AddGearArgs): void {
  const { size, position, world } = args
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}`
  invariant(world.gears[gearId] === undefined)

  let connections: Connection[]
  let sign = 0

  switch (args.connectionType) {
    case ConnectionType.Teeth: {
      connections = getConnections({
        size,
        position,
        world,
      })

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
          invariant(
            sign === Math.sign(neighbor.velocity) * -1,
          )
        }

        neighbors.forEach((neighbor) => {
          neighbor.connections.push({
            type: ConnectionType.Teeth,
            gearId,
          })
        })
      }
      break
    }
    case ConnectionType.Chain: {
      const { chain } = args

      sign = Math.sign(chain.velocity)

      // TODO allow other connections
      connections = [
        {
          gearId: chain.id,
          type: ConnectionType.Chain,
        },
      ]

      chain.connections.push({
        gearId,
        type: ConnectionType.Chain,
      })
      break
    }
    case ConnectionType.Attached: {
      invariant(false)
    }
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

  for (const tileId of iterateGearTileIds(position, size)) {
    invariant(world.tiles[tileId] === undefined)
    world.tiles[tileId] = { gearId }
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
