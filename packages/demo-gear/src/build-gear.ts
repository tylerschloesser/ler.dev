import invariant from 'tiny-invariant'
import {
  ConnectionType,
  EntityType,
  GearEntity,
  IAppContext,
} from './types.js'
import {
  getEntity,
  incrementBuildVersion,
  iterateGearTileIds,
} from './util.js'

export function addChainConnection(
  gear1: GearEntity,
  gear2: GearEntity,
  context: IAppContext,
): void {
  // TODO validate
  gear1.connections.push({
    type: ConnectionType.enum.Chain,
    entityId: gear2.id,
    multiplier: 1,
  })
  gear2.connections.push({
    type: ConnectionType.enum.Chain,
    entityId: gear1.id,
    multiplier: 1,
  })

  // TODO conserve energy!

  // TODO consolidate this with build somehow?
  incrementBuildVersion(context)
}

export function buildGear(
  context: IAppContext,
  gear: GearEntity,
): void {
  const { world } = context

  let attach: GearEntity | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Attach) {
      const entity = getEntity(context, connection.entityId)
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
