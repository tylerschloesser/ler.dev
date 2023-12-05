import invariant from 'tiny-invariant'
import { SimpleVec2, World } from './types.js'

export function addBelt(
  world: World,
  path: SimpleVec2[],
): void {
  const { belts, tiles } = world
  const first = path.at(0)
  invariant(first)

  const beltId = `belt.${first.x}.${first.y}`
  invariant(belts[beltId] === undefined)
  belts[beltId] = {
    id: beltId,
    path,
  }
  for (const { x, y } of path) {
    const tileId = `${x}.${y}`
    let tile = tiles[tileId]
    if (!tile) {
      tile = tiles[tileId] = {}
    }
    invariant(tile.beltId === undefined)
    tile.beltId = beltId
  }
}
