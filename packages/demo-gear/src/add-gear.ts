import invariant from 'tiny-invariant'
import {
  Connection,
  ConnectionType,
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

  let attach: Gear | undefined
  for (const connection of connections) {
    if (connection.type !== ConnectionType.enum.Attached) {
      continue
    }
    invariant(attach === undefined)
    attach = world.gears[connection.gearId]
    invariant(attach)
  }

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
    node.angle = 0
  }

  return gear
}
