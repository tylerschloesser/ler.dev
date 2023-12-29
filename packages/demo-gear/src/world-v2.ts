import invariant from 'tiny-invariant'
import { initBeltPaths, initTiles } from './derived.js'
import {
  DerivedError,
  Either,
  Vec2,
} from './types-common.js'
import { Derived } from './types-derived.js'
import { Entity, EntityId } from './types-entity.js'
import { Origin } from './types-origin.js'
import { World } from './types-world.js'

export function initWorld(): World {
  const origin = initOrigin()
  const derived = initDerived(origin)
  invariant(derived.right)
  return {
    origin,
    derived: derived.right,
  }
}

export function addEntities(
  world: World,
  entities: Entity[],
): void {
  validateEntitiesToAdd(entities)

  const { origin } = world

  for (const entity of entities) {
    if (origin.entities[entity.id]) {
      replaceEntity(origin, entity)
    } else {
      addEntity(origin, entity)
    }
  }

  const derived = initDerived(origin)
  invariant(derived.right)
  world.derived = derived.right
}

function validateEntitiesToAdd(entities: Entity[]): void {
  const entityIds = new Set<EntityId>()
  for (const entity of entities) {
    invariant(!entityIds.has(entity.id))
    entityIds.add(entity.id)
  }
}

function addEntity(origin: Origin, entity: Entity): void {
  invariant(!origin.entities[entity.id])
  origin.entities[entity.id] = entity
}

function replaceEntity(
  origin: Origin,
  entity: Entity,
): void {
  const existing = origin.entities[entity.id]
  invariant(existing?.id === entity.id)
  invariant(existing.type === entity.type)
  invariant(isVec2Equal(existing.position, entity.position))
  invariant(isVec2Equal(existing.size, entity.size))
}

function initOrigin(): Origin {
  return {
    entities: {},
  }
}

function initDerived(
  origin: Origin,
): Either<DerivedError, Derived> {
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
      nextEntityId: 0,
    },
  }
}

function isVec2Equal(a: Vec2, b: Vec2): boolean {
  return a[0] === b[0] && a[1] === b[1]
}
