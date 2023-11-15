import invariant from 'tiny-invariant'
import { Connection, Gear, Vec2, World } from './types.js'
import {
  iterateGearTileIds,
  iterateNetwork,
} from './util.js'

interface AddGearArgs {
  size: number
  position: Vec2
  world: World
  connections: Connection[]
}

export function addGear({
  size,
  position,
  world,
  connections,
}: AddGearArgs): Gear {
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}`
  invariant(world.gears[gearId] === undefined)

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

  for (const connection of connections) {
    const peer = world.gears[connection.gearId]
    invariant(peer)
    peer.connections.push({
      gearId,
      type: connection.type,
    })
  }

  for (const node of iterateNetwork(gear, world.gears)) {
    node.gear.velocity = 0
  }

  return gear
}
