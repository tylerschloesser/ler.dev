import { BeltPath, Derived } from './types-derived.js'
import { Origin } from './types-origin.js'

export function initTiles(
  origin: Origin,
): Derived['tiles'] {
  return {}
}

export function initBeltPaths(
  origin: Origin,
  tiles: Derived['tiles'],
): BeltPath[] {
  const beltPaths: BeltPath[] = []
  return beltPaths
}
