import invariant from 'tiny-invariant'
import { Belt, BuildHand, IAppContext } from './types.js'

export function buildBelt(
  context: IAppContext,
  hand: BuildHand,
  belt: Belt,
): void {
  const { world } = context
  invariant(world.entities[belt.id] === undefined)
  world.entities[belt.id] = belt

  const { x, y } = belt.position
  const tileId = `${x}.${y}`
  let tile = world.tiles[tileId]
  if (!tile) {
    tile = world.tiles[tileId] = {}
  }
  invariant(tile.entityId === undefined)
  tile.entityId = belt.id

  // add connections to existing entities
  for (const connection of belt.connections) {
    if (hand.entities[connection.entityId]) {
      const entity = hand.entities[connection.entityId]
      // double check there is a connection back
      invariant(
        entity?.connections.find(
          (c) => c.entityId === belt.id,
        ),
      )
      continue
    } else {
      const entity =
        context.world.entities[connection.entityId]
      invariant(entity)

      // verify there is currently no connection
      invariant(
        !entity.connections.find(
          (c) => c.entityId === belt.id,
        ),
      )

      entity.connections.push({
        entityId: belt.id,
        multiplier: 1 / connection.multiplier,
        type: connection.type,
      })
    }
  }
}
