import invariant from 'tiny-invariant'
import { BeltPath, Connection, World } from './types.js'

export function addBelt(
  world: World,
  path: BeltPath,
): void {
  const { belts, tiles } = world
  const first = path.at(0)
  invariant(first)

  const beltId = `belt.${first.position.x}.${first.position.y}`
  invariant(belts[beltId] === undefined)
  belts[beltId] = {
    id: beltId,
    path,
    connections: [],
    velocity: 0,
    offset: 0,
  }
  for (const cell of path) {
    const { x, y } = cell.position
    const tileId = `${x}.${y}`
    let tile = tiles[tileId]
    if (!tile) {
      tile = tiles[tileId] = {}
    }
    invariant(tile.beltId === undefined)
    tile.beltId = beltId
  }
}

export function getAdjacentGears(
  world: World,
  path: BeltPath,
): Connection[] {
  return []
}
