import invariant from 'tiny-invariant'
import {
  BeltId,
  BeltPath,
  ConnectionType,
  DeleteHand,
  IAppContext,
} from './types.js'
import { iterateGearTileIds } from './util.js'

export function executeDelete(
  context: IAppContext,
  hand: DeleteHand,
): void {
  for (const gearId of hand.gearIds) {
    const gear = context.world.gears[gearId]
    invariant(gear)

    for (const tileId of iterateGearTileIds(
      gear.center,
      gear.radius,
    )) {
      const tile = context.world.tiles[tileId]
      invariant(tile)

      if (tile.attachedGearId === gearId) {
        delete tile.attachedGearId
      } else {
        invariant(tile.gearId === gearId)
        if (tile.attachedGearId) {
          tile.gearId = tile.attachedGearId
          delete tile.attachedGearId
        } else {
          delete tile.gearId
        }
      }

      if (!tile.gearId && !tile.resourceType) {
        delete context.world.tiles[tileId]
      }
    }

    for (const connection of gear.connections) {
      invariant(
        connection.type !== ConnectionType.enum.Belt,
        'TODO support belt connections',
      )
      const neighbor =
        context.world.gears[connection.gearId]
      invariant(neighbor)
      const index = neighbor.connections.findIndex(
        (c) =>
          c.type !== ConnectionType.enum.Belt &&
          c.gearId === gear.id,
      )
      invariant(index !== -1)
      neighbor.connections.splice(index, 1)
    }

    delete context.world.gears[gearId]
  }

  const beltIds = new Set<BeltId>()

  for (const tileId of hand.tileIds) {
    const tile = context.world.tiles[tileId]
    invariant(tile)
    if (tile.beltId) {
      beltIds.add(tile.beltId)
    }
    if (tile.resourceType) {
      delete tile.resourceType
    }
    if (Object.keys(tile).length === 0) {
      delete context.world.tiles[tileId]
    }
  }

  // for (const beltId of beltIds) {
  //   const belt = context.world.belts[beltId]
  //   invariant(belt)
  //   const { path: oldPath } = belt
  //   delete context.world.belts[beltId]

  //   let newPath: BeltPath = []
  //   for (const cell of oldPath) {
  //     const { position } = cell
  //     const tileId = `${position.x}.${position.y}`
  //     const tile = context.world.tiles[tileId]
  //     invariant(tile)
  //     invariant(tile.beltId === beltId)
  //     delete tile.beltId
  //     if (hand.tileIds.has(tileId)) {
  //       if (newPath.length) {
  //         addBelt(context.world, newPath)
  //         newPath = []
  //       }
  //     } else {
  //       newPath.push(cell)
  //     }
  //   }
  //   if (newPath.length) {
  //     addBelt(context.world, newPath)
  //   }
  // }
}
