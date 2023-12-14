import invariant from 'tiny-invariant'
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
        const right = getBeltRight(world, current)
        if (right && !seen.has(right)) {
          stack.push(right)
          path.push(right)
        }
        const left = getBeltLeft(world, current)
        if (left && !seen.has(left)) {
          stack.push(left)
          path.unshift(left)
        }
      } else {
        invariant(current.direction === 'y')
        // TODO
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
      remove,
    } of iterateBeltItems(path)) {
      const nextPosition =
        item.position + belt.velocity * elapsed
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

function getBeltRight(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x + 1}.${current.position.y}`
  const tile = world.tiles[tileId]
  let right: Entity | undefined = undefined
  if (tile?.entityId) {
    right = world.entities[tile.entityId]
    invariant(right)
  }
  if (
    right?.type === EntityType.enum.Belt &&
    right.direction === 'x'
  ) {
    // TODO validate connection
    invariant(right.velocity === current.velocity)

    return right
  }
  return null
}

function getBeltLeft(
  world: World,
  current: BeltEntity,
): BeltEntity | null {
  // prettier-ignore
  const tileId = `${current.position.x - 1}.${current.position.y}`
  const tile = world.tiles[tileId]
  let left: Entity | undefined = undefined
  if (tile?.entityId) {
    left = world.entities[tile.entityId]
    invariant(left)
  }
  if (
    left?.type === EntityType.enum.Belt &&
    left.direction === 'x'
  ) {
    // TODO validate connection
    invariant(left.velocity === current.velocity)

    return left
  }
  return null
}

const BELT_ITEM_ITERATOR: {
  belt: BeltEntity
  item: BeltItem
  next: BeltEntity | null
  prev: BeltEntity | null
  remove: Set<BeltItem>
} = {
  belt: null!,
  item: null!,
  next: null,
  prev: null,
  remove: new Set<BeltItem>(),
}

function* iterateBeltItems(path: BeltEntity[]) {
  const first = path.at(0)
  if (!first) return

  if (first.velocity > 0) {
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

        yield BELT_ITEM_ITERATOR
      }
      if (BELT_ITEM_ITERATOR.remove.size) {
        belt.items = belt.items.filter(
          (v) => !BELT_ITEM_ITERATOR.remove.has(v),
        )
      }
    }
  } else if (first.velocity < 0) {
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
