import invariant from 'tiny-invariant'
import {
  DerivedError,
  DerivedErrorType,
  Either,
} from './types-common.js'
import {
  BeltDirection,
  BeltPath,
  BeltPathEntity,
  Derived,
  beltDirection,
} from './types-derived.js'
import {
  BeltEntity,
  Entity,
  EntityId,
  entityType,
} from './types-entity.js'
import { Origin } from './types-origin.js'

type Tiles = Derived['tiles']

export function initTiles(origin: Origin): Tiles {
  const tiles: Tiles = {}

  for (const entity of Object.values(origin.entities)) {
    for (const tileId of iterateTilesIds(entity)) {
      let tile = tiles[tileId]
      if (!tile) {
        tile = tiles[tileId] = {
          entityIds: [],
        }
      }
      invariant(!tile.entityIds.includes(entity.id))
      tile.entityIds.push(entity.id)
    }
  }

  return tiles
}

export function initBeltPaths(
  origin: Origin,
  tiles: Tiles,
): Either<DerivedError, BeltPath[]> {
  const beltPaths: BeltPath[] = []

  const seen = new Set<EntityId>()
  for (const root of Object.values(origin.entities)) {
    if (
      root.type !== entityType.enum.Belt ||
      seen.has(root.id)
    ) {
      continue
    }

    const beltPath = getBeltPath(origin, tiles, root)
    if (beltPath.left) {
      return beltPath
    }
    invariant(beltPath.right)
    for (const { id: entityId } of beltPath.right
      .entities) {
      invariant(!seen.has(entityId))
      seen.add(entityId)
    }

    beltPaths.push(beltPath.right)
  }

  return { left: null, right: beltPaths }
}

function getAdjacentBelt(
  origin: Origin,
  tiles: Tiles,
  root: BeltEntity,
  dx: number,
  dy: number,
): BeltEntity | null {
  const [x, y] = root.position
  const tileId = `${x + dx}.${y + dy}`
  const tile = tiles[tileId]
  if (!tile?.entityIds) return null
  invariant(tile.entityIds.length > 0)

  let belt: BeltEntity | null = null
  for (const entityId of tile.entityIds) {
    const entity = origin.entities[entityId]
    invariant(entity)
    if (entity.type !== entityType.enum.Belt) continue
    // there should be only one belt on a tile
    invariant(belt === null)
    belt = entity
  }
  return belt
}

function getAdjacentBelts(
  origin: Origin,
  tiles: Tiles,
  root: BeltEntity,
): BeltEntity[] {
  return [
    getAdjacentBelt(origin, tiles, root, 1, 0),
    getAdjacentBelt(origin, tiles, root, -1, 0),
    getAdjacentBelt(origin, tiles, root, 0, 1),
    getAdjacentBelt(origin, tiles, root, 0, -1),
  ].filter((b): b is BeltEntity => b !== null)
}

function* iterateBeltPath(
  origin: Origin,
  tiles: Tiles,
  seen: Set<BeltEntity>,
  root: BeltEntity,
  next: BeltEntity | undefined,
): Generator<Either<DerivedError, BeltEntity>> {
  let prev = root
  while (next) {
    yield { left: null, right: next }

    if (seen.has(next)) {
      // the only reason this belt should be seen is if there is a loop
      invariant(next === root)
      return
    }
    seen.add(next)

    const adjacent = getAdjacentBelts(origin, tiles, next)
    if (adjacent.length > 2) {
      yield {
        left: {
          type: DerivedErrorType.BeltHasMoreThanTwoAdjacentBelts,
          entityId: next.id,
        },
        right: null,
      }
    }
    invariant(adjacent.length <= 2)
    const [a, b] = adjacent
    if (a === prev) {
      prev = next
      next = b
    } else if (b === prev) {
      prev = next
      next = a
    } else {
      invariant(false)
    }
  }
}

function getBeltPath(
  origin: Origin,
  tiles: Tiles,
  root: BeltEntity,
): Either<DerivedError, BeltPath> {
  let loop = false
  const belts = new Array<BeltEntity>(root)
  const seen = new Set<BeltEntity>([root])

  const adjacent = getAdjacentBelts(origin, tiles, root)
  invariant(adjacent.length <= 2)

  for (const left of iterateBeltPath(
    origin,
    tiles,
    seen,
    root,
    adjacent[0],
  )) {
    if (left.left) {
      return left
    }
    invariant(left.right)
    if (left.right === root) {
      loop = true
      break
    }
    belts.unshift(left.right)
  }
  for (const right of iterateBeltPath(
    origin,
    tiles,
    seen,
    root,
    adjacent[1],
  )) {
    if (right.left) {
      return right
    }
    invariant(right.right !== root)
    belts.push(right.right)
  }

  const entities = new Array<BeltPathEntity>()

  for (let i = 0; i < belts.length; i++) {
    const belt = belts[i]
    invariant(belt)
    const prev =
      i === 0
        ? loop
          ? belts.at(-1)
          : null
        : belts.at(i - 1)
    const next = belts.at(i + 1)

    let direction: BeltDirection | undefined = undefined

    if (prev && next) {
      const prevDx = prev.position[0] - belt.position[0]
      const prevDy = prev.position[1] - belt.position[1]
      invariant(prevDx === 0 || prevDy === 0)
      // prettier-ignore
      invariant(prevDx === 1 || prevDx === -1 || prevDy === 1 || prevDy === -1)

      const nextDx = next.position[0] - belt.position[0]
      const nextDy = next.position[1] - belt.position[1]
      invariant(nextDx === 0 || nextDy === 0)
      // prettier-ignore
      invariant(nextDx === 1 || nextDx === -1 || nextDy === 1 || nextDy === -1)

      // prettier-ignore
      if ((nextDx === 1 || nextDx === -1) && (prevDx === 1 || prevDx === -1)) {
        direction = beltDirection.enum.WestEast
      } else if ((nextDy === 1 || nextDy === -1) && (prevDy === 1 || prevDy === -1)) {
        direction = beltDirection.enum.NorthSouth
      } else {

        if (prevDx === -1 && nextDy === -1) {
          direction = beltDirection.enum.WestNorth
        } else if (prevDy === -1 && nextDx === -1) {
          direction = beltDirection.enum.WestNorth
        }

      }
    } else if (prev) {
      const prevDx = belt.position[0] - prev.position[0]
      const prevDy = belt.position[1] - prev.position[1]
      invariant(prevDx === 0 || prevDy === 0)
      // prettier-ignore
      invariant(prevDx === 1 || prevDx === -1 || prevDy === 1 || prevDy === -1)

      if (prevDx === 1 || prevDx === -1) {
        direction = beltDirection.enum.WestEast
      } else {
        direction = beltDirection.enum.NorthSouth
      }
    } else if (next) {
      const nextDx = next.position[0] - belt.position[0]
      const nextDy = next.position[1] - belt.position[1]
      invariant(nextDx === 0 || nextDy === 0)
      // prettier-ignore
      invariant(nextDx === 1 || nextDx === -1 || nextDy === 1 || nextDy === -1)

      if (nextDx === 1 || nextDx === -1) {
        direction = beltDirection.enum.WestEast
      } else {
        direction = beltDirection.enum.NorthSouth
      }
    } else {
      // lone belts are horizontal by default
      direction = beltDirection.enum.WestEast
    }

    invariant(direction)

    entities.push({
      id: belt.id,
      direction,
      invert: false,
    })
  }

  return {
    left: null,
    right: { entities, loop },
  }
}

function* iterateTilesIds(entity: Entity) {
  const [x, y] = entity.position
  const [sx, sy] = entity.size
  for (let dx = 0; dx < sx; dx++) {
    for (let dy = 0; dy < sy; dy++) {
      yield `${x + dx}.${y + dy}`
    }
  }
}
