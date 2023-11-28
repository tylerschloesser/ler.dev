import invariant from 'tiny-invariant'
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
  chain: Gear | null,
  attach: Gear | null,
  state: AppState,
): void {
  const { world } = state

  const { position, radius, connections, angle, velocity } =
    partial

  const gearId = `${position.x}.${position.y}.${radius}`
  invariant(world.gears[gearId] === undefined)

  const mass = Math.PI * radius ** 2

  if (chain) {
    connections.push({
      type: ConnectionType.enum.Chain,
      gearId: chain.id,
    })
  }
  if (attach) {
    connections.push({
      type: ConnectionType.enum.Attach,
      gearId: attach.id,
    })
  }

  for (const connection of connections) {
    const node = world.gears[connection.gearId]
    invariant(node)
    node.connections.push({
      type: connection.type,
      gearId,
    })
  }

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
}
