import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  Belt,
  BeltItem,
  BeltTurn,
  ConnectionType,
  World,
} from './types.js'
import { isBelt } from './util.js'

export function tickBeltItems(
  world: World,
  elapsed: number,
): void {
  const paths = getPaths(world)

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
          item.position = 1 - (nextPosition + 1)
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

const BELT_ITEM_ITERATOR: {
  belt: Belt
  item: BeltItem
  next: Belt | null
  prev: Belt | null
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

function* iterateBeltItems(path: Belt[]) {
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

type BeltRelationship = 'next' | 'prev'
function getRelationship(
  a: Belt,
  b: Belt,
): BeltRelationship {
  let nextX = a.position.x
  let nextY = a.position.y

  switch (a.turn) {
    case BeltTurn.enum.None: {
      switch (a.rotation) {
        case 0:
          nextX += 1
          break
        case 90:
          nextY += 1
          break
        case 180:
          nextX -= 1
          break
        case 270:
          nextY -= 1
          break
      }
      break
    }
    case BeltTurn.enum.Left: {
      switch (a.rotation) {
        case 0:
          nextY -= 1
          break
        case 90:
          nextX += 1
          break
        case 180:
          nextY += 1
          break
        case 270:
          nextX -= 1
          break
      }
    }
    case BeltTurn.enum.Right: {
      switch (a.rotation) {
        case 0:
          nextY += 1
          break
        case 90:
          nextX -= 1
          break
        case 180:
          nextY -= 1
          break
        case 270:
          nextX += 1
          break
      }
    }
  }

  if (b.position.x === nextX && b.position.y === nextY) {
    return 'next'
  }

  let prevX = a.position.x
  let prevY = a.position.y

  switch (a.rotation) {
    case 0:
      prevX -= 1
      break
    case 90:
      prevY -= 1
      break
    case 180:
      prevX += 1
      break
    case 270:
      prevY += 1
      break
  }

  invariant(
    b.position.x === prevX && b.position.y === prevY,
  )

  return 'prev'
}

function getPaths(world: World): Array<Belt[]> {
  const belts = Object.values(world.entities).filter(isBelt)

  const paths = new Array<Belt[]>()
  const seen = new Set<Belt>()

  for (const root of belts) {
    if (seen.has(root)) continue

    const path = new Array<Belt>(root)
    const stack = new Array<Belt>(root)

    while (stack.length) {
      const current = stack.pop()
      invariant(current)
      seen.add(current)

      for (const connection of current.connections) {
        if (connection.type !== ConnectionType.enum.Belt)
          continue
        const neighbor = world.entities[connection.entityId]
        invariant(isBelt(neighbor))
        invariant(connection.multiplier === 1)
        if (seen.has(neighbor)) continue
        stack.push(neighbor)

        const relationship = getRelationship(
          current,
          neighbor,
        )
        if (relationship === 'prev') {
          path.unshift(neighbor)
        } else {
          invariant(relationship === 'next')
          path.push(neighbor)
        }
      }
    }
    paths.push(path)
  }

  return paths
}
