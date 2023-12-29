import { Derived } from './types-derived.js'
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
