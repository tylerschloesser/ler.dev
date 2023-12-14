import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  BeltEntity,
  BeltItem,
  Entity,
  EntityType,
  World,
} from './types.js'

export function tickBeltItems(
  world: World,
  elapsed: number,
): void {
  const belts = Object.values(world.entities).filter(
    (entity): entity is BeltEntity =>
      entity.type === EntityType.enum.Belt,
  )

  const paths = new Array<Array<BeltEntity>>()

  const seen = new Set<BeltEntity>()

  for (const root of belts) {
    if (seen.has(root)) continue

    const path = new Array<BeltEntity>(root)
    const stack = new Array<BeltEntity>(root)
    while (stack.length) {
      const current = stack.pop()
      invariant(current)
      seen.add(current)

      if (current.direction === 'x') {
        const east = getBeltEast(world, current)
        if (east && !seen.has(east)) {
          stack.push(east)
          path.push(east)
        }
        const west = getBeltWest(world, current)
        if (west && !seen.has(west)) {
          stack.push(west)
          path.unshift(west)
        }
      } else {
        invariant(current.direction === 'y')
        const north = getBeltNorth(world, current)
        if (north && !seen.has(north)) {
          stack.push(north)
          path.unshift(north)
        }
        const south = getBeltSouth(world, current)
        if (south && !seen.has(south)) {
          stack.push(south)
          path.push(south)
        }
      }
    }
    paths.push(path)
  }

  for (const path of paths) {
    for (const {
      belt,
      prev,
      next,
      item,
      available,
      remove,
    } of iterateBeltItems(path)) {
      // note that due to Math.min, this might actually
      // "teleport" backwards if, e.g. a new item
      // is manually added with an invalid gap
      //
      const dp =
        Math.sign(belt.velocity) *
        Math.min(
          Math.abs(belt.velocity * elapsed),
          available,
        )

      const nextPosition = item.position + dp
      if (nextPosition > 1) {
        if (next) {
          item.position = nextPosition - 1
          next.items.unshift(item)
          remove.add(item)
        } else {
          item.position = 1
        }
      } else if (nextPosition < 0) {
        if (prev) {
          item.position = nextPosition + 1
          prev.items.push(item)
          remove.add(item)
        } else {
          item.position = 0
        }
      } else {
        item.position = nextPosition
      }
    }
  }
}

function getBeltEast(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x + 1}.${current.position.y}`
  const tile = world.tiles[tileId]
  let east: Entity | undefined = undefined
  if (tile?.entityId) {
    east = world.entities[tile.entityId]
    invariant(east)
  }
  if (
    east?.type === EntityType.enum.Belt &&
    east.direction === 'x'
  ) {
    // TODO validate connection
    invariant(east.velocity === current.velocity)

    return east
  }
  return null
}

function getBeltWest(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x - 1}.${current.position.y}`
  const tile = world.tiles[tileId]
  let west: Entity | undefined = undefined
  if (tile?.entityId) {
    west = world.entities[tile.entityId]
    invariant(west)
  }
  if (
    west?.type === EntityType.enum.Belt &&
    west.direction === 'x'
  ) {
    // TODO validate connection
    invariant(west.velocity === current.velocity)

    return west
  }
  return null
}

function getBeltNorth(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x}.${current.position.y - 1}`
  const tile = world.tiles[tileId]
  let north: Entity | undefined = undefined
  if (tile?.entityId) {
    north = world.entities[tile.entityId]
    invariant(north)
  }
  if (
    north?.type === EntityType.enum.Belt &&
    north.direction === 'y'
  ) {
    // TODO validate connection
    invariant(north.velocity === current.velocity)

    return north
  }
  return null
}

function getBeltSouth(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x}.${current.position.y + 1}`
  const tile = world.tiles[tileId]
  let south: Entity | undefined = undefined
  if (tile?.entityId) {
    south = world.entities[tile.entityId]
    invariant(south)
  }
  if (
    south?.type === EntityType.enum.Belt &&
    south.direction === 'y'
  ) {
    // TODO validate connection
    invariant(south.velocity === current.velocity)

    return south
  }
  return null
}

const BELT_ITEM_ITERATOR: {
  belt: BeltEntity
  item: BeltItem
  next: BeltEntity | null
  prev: BeltEntity | null
  available: number
  remove: Set<BeltItem>
} = {
  belt: null!,
  item: null!,
  next: null,
  prev: null,
  available: null!,
  remove: new Set<BeltItem>(),
}

function* iterateBeltItems(path: BeltEntity[]) {
  const first = path.at(0)
  if (!first) return

  if (first.velocity > 0) {
    let prevAbsolutePosition = path.length

    for (let i = path.length - 1; i >= 0; i--) {
      const belt = path[i]
      invariant(belt)
      BELT_ITEM_ITERATOR.belt = belt
      BELT_ITEM_ITERATOR.prev = path[i - 1] ?? null
      BELT_ITEM_ITERATOR.next = path[i + 1] ?? null
      BELT_ITEM_ITERATOR.remove.clear()
      for (let j = belt.items.length - 1; j >= 0; j--) {
        const item = belt.items[j]
        invariant(item)
        BELT_ITEM_ITERATOR.item = item

        const absolutePosition = i + item.position
        BELT_ITEM_ITERATOR.available =
          prevAbsolutePosition -
          absolutePosition -
          BELT_ITEM_GAP
        prevAbsolutePosition = absolutePosition

        yield BELT_ITEM_ITERATOR
      }
      if (BELT_ITEM_ITERATOR.remove.size) {
        belt.items = belt.items.filter(
          (v) => !BELT_ITEM_ITERATOR.remove.has(v),
        )
      }
    }
  } else if (first.velocity < 0) {
    let prevAbsolutePosition = 0

    for (let i = 0; i < path.length; i++) {
      const belt = path[i]
      invariant(belt)
      BELT_ITEM_ITERATOR.belt = belt
      BELT_ITEM_ITERATOR.prev = path[i - 1] ?? null
      BELT_ITEM_ITERATOR.next = path[i + 1] ?? null
      BELT_ITEM_ITERATOR.remove.clear()
      for (let j = 0; j < belt.items.length; j++) {
        const item = belt.items[j]
        invariant(item)
        BELT_ITEM_ITERATOR.item = item

        const absolutePosition = i + item.position
        BELT_ITEM_ITERATOR.available = Math.abs(
          prevAbsolutePosition +
            BELT_ITEM_GAP -
            absolutePosition,
        )
        prevAbsolutePosition = absolutePosition

        yield BELT_ITEM_ITERATOR
      }
      if (BELT_ITEM_ITERATOR.remove.size) {
        belt.items = belt.items.filter(
          (v) => !BELT_ITEM_ITERATOR.remove.has(v),
        )
      }
    }
  }
}
