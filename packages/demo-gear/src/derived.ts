import invariant from 'tiny-invariant'
import {
  AddEntityError,
  AddEntityErrorType,
  E,
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

export function initTiles(
  origin: Origin,
): Either<AddEntityError[], Tiles> {
  const errors: AddEntityError[] = []
  const tiles: Tiles = {}

  for (const entity of Object.values(origin.entities)) {
    for (const tileId of iterateTilesIds(entity)) {
      const tile = tiles[tileId]
      if (tile) {
        errors.push({
          type: AddEntityErrorType.OccupiedTile,
          tileId,
        })
      } else {
        tiles[tileId] = { entityId: entity.id }
      }
    }
  }

  if (errors.length) {
    return E.left(errors)
  }
  return E.right(tiles)
}

export function initBeltPaths(
  origin: Origin,
  tiles: Tiles,
): Either<AddEntityError[], BeltPath[]> {
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

  return E.right(beltPaths)
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
  if (!tile?.entityId) return null
  const belt = origin.entities[tile.entityId]
  if (belt?.type === entityType.enum.Belt) {
    return belt
  }
  return null
}

function getAdjacentBelts(
  origin: Origin,
  tiles: Tiles,
  root: BeltEntity,
): BeltEntity[] {
  return [
    getAdjacentBelt(origin, tiles, root, 1, 0),
    getAdjacentBelt(origin, tiles, root, 0, 1),
    getAdjacentBelt(origin, tiles, root, -1, 0),
    getAdjacentBelt(origin, tiles, root, 0, -1),
  ].filter((b): b is BeltEntity => b !== null)
}

function* iterateBeltPath(
  origin: Origin,
  tiles: Tiles,
  seen: Set<BeltEntity>,
  root: BeltEntity,
  next: BeltEntity | undefined,
): Generator<Either<AddEntityError[], BeltEntity>> {
  let prev = root
  while (next) {
    yield E.right(next)

    if (seen.has(next)) {
      // the only reason this belt should be seen is if there is a loop
      invariant(next === root)
      return
    }
    seen.add(next)

    const adjacent = getAdjacentBelts(origin, tiles, next)
    if (adjacent.length > 2) {
      yield E.left([
        {
          type: AddEntityErrorType.BeltHasMoreThanTwoAdjacentBelts,
          position: next.position,
        },
      ])
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
): Either<AddEntityError[], BeltPath> {
  let loop = false
  const belts = new Array<BeltEntity>(root)
  const seen = new Set<BeltEntity>([root])

  const adjacent = getAdjacentBelts(origin, tiles, root)
  invariant(adjacent.length <= 2)

  for (const next of iterateBeltPath(
    origin,
    tiles,
    seen,
    root,
    adjacent[0],
  )) {
    if (next.left) {
      return next
    }
    invariant(next.right)
    if (next.right === root) {
      loop = true
      break
    }
    belts.push(next.right)
  }
  if (!loop) {
    for (const prev of iterateBeltPath(
      origin,
      tiles,
      seen,
      root,
      adjacent[1],
    )) {
      if (prev.left) {
        return prev
      }
      invariant(prev.right !== root)
      belts.unshift(prev.right)
    }
  }

  const entities = new Array<BeltPathEntity>()

  for (let i = 0; i < belts.length; i++) {
    const belt = belts[i]
    invariant(belt)
    const prev =
      i === 0
        ? loop
          ? belts.at(-1)
          : undefined
        : belts.at(i - 1)
    const next = belts.at(i + 1)

    const { direction, invert } = getBeltDirection(
      belt,
      prev,
      next,
    )

    entities.push({
      id: belt.id,
      direction,
      invert,
    })
  }

  return E.right({ entities, loop })
}

enum Direction {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
}

function getDirection(
  from: BeltEntity,
  to: BeltEntity,
): Direction {
  const dx = to.position[0] - from.position[0]
  const dy = to.position[1] - from.position[1]
  invariant(dx === 0 || dy === 0)
  if (dx === 1) {
    return Direction.East
  } else if (dx === -1) {
    return Direction.West
  } else if (dy === 1) {
    return Direction.South
  } else if (dy === -1) {
    return Direction.North
  }
  invariant(false)
}

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.East]: Direction.West,
  [Direction.West]: Direction.East,
  [Direction.North]: Direction.South,
  [Direction.South]: Direction.North,
}

function getBeltDirection(
  belt: BeltEntity,
  prev: BeltEntity | undefined,
  next: BeltEntity | undefined,
): {
  direction: BeltDirection
  invert: boolean
} {
  let prevDirection = prev ? getDirection(belt, prev) : null
  let nextDirection = next ? getDirection(belt, next) : null

  if (!prevDirection && !nextDirection) {
    // lone belts are horizontal by default
    prevDirection = Direction.West
    nextDirection = Direction.East
  } else if (!prevDirection) {
    invariant(nextDirection)
    prevDirection = OPPOSITE_DIRECTION[nextDirection]
  } else if (!nextDirection) {
    nextDirection = OPPOSITE_DIRECTION[prevDirection]
  }

  const result = (
    direction: BeltDirection,
    invert: boolean,
  ) => ({
    direction,
    invert,
  })

  invariant(prevDirection)
  invariant(nextDirection)
  invariant(prevDirection !== nextDirection)

  // prettier-ignore
  switch (prevDirection) {
    case Direction.West: {
      switch (nextDirection) {
        case Direction.East:
          return result(beltDirection.enum.WestEast, false)
        case Direction.North:
          return result(beltDirection.enum.WestNorth, false)
        case Direction.South:
          return result(beltDirection.enum.SouthWest, true)
      }
      break
    }
    case Direction.North: {
      switch (nextDirection) {
        case Direction.South:
          return result(beltDirection.enum.NorthSouth, false)
        case Direction.West:
          return result(beltDirection.enum.WestNorth, true)
        case Direction.East:
          return result(beltDirection.enum.NorthEast, false)
      }
      break
    }
    case Direction.East: {
      switch (nextDirection) {
        case Direction.West:
          return result(beltDirection.enum.WestEast, true)
        case Direction.North:
          return result(beltDirection.enum.NorthEast, true)
        case Direction.South:
          return result(beltDirection.enum.EastSouth, false)
      }
      break
    }
    case Direction.South: {
      switch (nextDirection) {
        case Direction.North:
          return result(beltDirection.enum.NorthSouth, true)
        case Direction.East:
          return result(beltDirection.enum.EastSouth, true)
        case Direction.West:
          return result(beltDirection.enum.SouthWest, false)
      }
      break
    }
  }

  invariant(false)
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
