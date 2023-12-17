import invariant from 'tiny-invariant'
import {
  ConnectionType,
  EntityType,
  GearEntity,
  World,
} from './types.js'
import { getEntity, iterateGearTileIds } from './util.js'

export function buildGear(
  world: World,
  gear: GearEntity,
): void {
  let attach: GearEntity | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Attach) {
      const entity = getEntity(world, connection.entityId)
      invariant(entity.type === EntityType.enum.Gear)
      invariant(attach === null)
      attach = entity
    }
  }

  invariant(world.entities[gear.id] === undefined)

  world.entities[gear.id] = gear

  for (const tileId of iterateGearTileIds(
    gear.center,
    gear.radius,
  )) {
    let tile = world.tiles[tileId]

    if (attach) {
      invariant(tile?.entityId === attach.id)
      tile.entityId = gear.id
    } else {
      invariant(tile === undefined)
      tile = world.tiles[tileId] = { entityId: gear.id }
    }
  }
}
