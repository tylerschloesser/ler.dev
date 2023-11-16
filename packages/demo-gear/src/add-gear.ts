import invariant from 'tiny-invariant'
import {
  Connection,
  Gear,
  SimpleVec2,
  World,
} from './types.js'
import {
  iterateGearTileIds,
  iterateNetwork,
} from './util.js'

interface AddGearArgs {
  radius: number
  position: SimpleVec2
  world: World
  connections: Connection[]
}

export function addGear({
  radius,
  position,
  world,
  connections,
}: AddGearArgs): Gear {
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}.${radius}`
  invariant(world.gears[gearId] === undefined)

  const mass = Math.PI * radius ** 2

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

  for (const tileId of iterateGearTileIds(
    position,
    radius,
  )) {
    let tile = world.tiles[tileId]
    if (!tile) {
      tile = world.tiles[tileId] = { gearIds: [] }
    }

    invariant(!tile.gearIds.includes(gearId))

    tile.gearIds.push(gearId)
  }

  for (const connection of connections) {
    const peer = world.gears[connection.gearId]
    invariant(peer)
    peer.connections.push({
      gearId,
      type: connection.type,
    })
  }

  for (const node of iterateNetwork(gear, world)) {
    node.velocity = 0
  }

  return gear
}
