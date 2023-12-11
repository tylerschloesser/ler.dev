import invariant from 'tiny-invariant'
import { Belt, BuildHand, IAppContext } from './types.js'

export function buildBelt(
  context: IAppContext,
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
}
