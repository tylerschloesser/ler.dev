import { Derived } from './types-derived.js'
import { Origin } from './types-origin.js'
import { World } from './types-world.js'

export function initWorld(): World {
  return {
    origin: initOrigin(),
    derived: initDerived(),
  }
}

function initOrigin(): Origin {
  return {
    entities: {},
  }
}

function initDerived(): Derived {
  return {
    beltPaths: [],
    tiles: {},
    nextEntityId: 0,
  }
}
