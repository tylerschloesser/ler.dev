import { Derived } from './types-derived.js'
import { Entity } from './types-entity.js'
import { Origin } from './types-origin.js'
import { World } from './types-world.js'

export function initWorld(): World {
  const origin = initOrigin()
  const derived = initDerived(origin)
  return {
    origin,
    derived,
  }
}

export function tryAddEntities(
  world: World,
  entities: Entity[],
): boolean {
  return true
}

function initOrigin(): Origin {
  return {
    entities: {},
  }
}

function initDerived(origin: Origin): Derived {
  return {
    beltPaths: [],
    tiles: {},
    nextEntityId: 0,
  }
}
