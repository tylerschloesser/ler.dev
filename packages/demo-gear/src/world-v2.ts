import { cloneDeep } from 'lodash-es'
import invariant from 'tiny-invariant'
import { initBeltPaths, initTiles } from './derived.js'
import {
  AddEntityError,
  E,
  Either,
  Vec2,
} from './types-common.js'
import { Derived } from './types-derived.js'
import {
  BuildEntity,
  Entity,
  entityType,
} from './types-entity.js'
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
    return E.right(world)
  }

  let { nextEntityId } = world
  const origin = cloneDeep(world.origin)

  for (const entity of entities) {
    const existing = getExistingEntity(world, entity)
    if (existing) {
      updateEntity(entity, existing)
    } else {
      addEntity(origin, {
        id: `${nextEntityId++}`,
        ...entity,
      })
    }
  }

  const derived = initDerived(origin)
  if (derived.left) {
    return derived
  }
  invariant(derived.right)

  return E.right({
    origin,
    derived: derived.right,
    nextEntityId,
  })
}

function updateEntity(
  entity: BuildEntity,
  existing: Entity,
): void {
  switch (entity.type) {
    case entityType.enum.Belt: {
      invariant(existing.type === entityType.enum.Belt)
      break
    }
    default: {
      invariant(false)
    }
  }
}

function getExistingEntity(
  world: World,
  entity: BuildEntity,
): Entity | null {
  switch (entity.type) {
    case entityType.enum.Belt: {
      const [x, y] = entity.position
      const tileId = `${x}.${y}`
      const tile = world.derived.tiles[tileId]
      if (!tile?.entityId) {
        return null
      }
      const existing = world.origin.entities[tile.entityId]
      invariant(existing)
      if (existing.type === entityType.enum.Belt) {
        return existing
      }
      return null
    }
    default: {
      invariant(false)
    }
  }
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
  if (tiles.left) {
    return tiles
  }
  const beltPaths = initBeltPaths(origin, tiles.right)
  if (beltPaths.left) {
    return beltPaths
  }
  invariant(beltPaths.right)
  return E.right({
    beltPaths: beltPaths.right,
    tiles: tiles.right,
  })
}

function isVec2Equal(a: Vec2, b: Vec2): boolean {
  return a[0] === b[0] && a[1] === b[1]
}
