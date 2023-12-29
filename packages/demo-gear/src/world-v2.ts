import { cloneDeep } from 'lodash-es'
import invariant from 'tiny-invariant'
import { initBeltPaths, initTiles } from './derived.js'
import {
  AddEntityError,
  Either,
  Vec2,
} from './types-common.js'
import { Derived } from './types-derived.js'
import { BuildEntity, Entity } from './types-entity.js'
import { Origin } from './types-origin.js'
import { World } from './types-world.js'

export function initWorld(): World {
  const origin = initOrigin()
  const derived = initDerived(origin)
  invariant(derived.right)
  return {
    origin,
    derived: derived.right,
    nextEntityId: 0,
  }
}

export function tryAddEntities(
  world: World,
  entities: BuildEntity[],
): Either<AddEntityError[], World> {
  if (entities.length === 0) {
    return { left: null, right: world }
  }

  const errors = validateEntitiesToAdd(entities)
  if (errors.length) {
    return { left: errors, right: null }
  }

  let { nextEntityId } = world
  const origin = cloneDeep(world.origin)

  for (const entity of entities) {
    addEntity(origin, {
      id: `${nextEntityId++}`,
      ...entity,
    })
  }

  const derived = initDerived(origin)
  if (derived.left) {
    return derived
  }
  invariant(derived.right)

  return {
    left: null,
    right: {
      origin,
      derived: derived.right,
      nextEntityId,
    },
  }
}

function getExistingEntity(
  origin: Origin,
  entity: BuildEntity,
): Entity | null {
  return null
}

function validateEntitiesToAdd(
  entities: BuildEntity[],
): AddEntityError[] {
  return []
}

function addEntity(origin: Origin, entity: Entity): void {
  invariant(!origin.entities[entity.id])
  origin.entities[entity.id] = entity
}

function initOrigin(): Origin {
  return {
    entities: {},
  }
}

function initDerived(
  origin: Origin,
): Either<AddEntityError[], Derived> {
  const tiles = initTiles(origin)
  const beltPaths = initBeltPaths(origin, tiles)
  if (beltPaths.left) {
    return beltPaths
  }
  invariant(beltPaths.right)
  return {
    left: null,
    right: {
      beltPaths: beltPaths.right,
      tiles,
    },
  }
}

function isVec2Equal(a: Vec2, b: Vec2): boolean {
  return a[0] === b[0] && a[1] === b[1]
}
