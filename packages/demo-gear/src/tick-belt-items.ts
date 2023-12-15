import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  Belt,
  BeltItem,
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
          if (next.multiplier === 1) {
            item.position = nextPosition - 1
          } else {
            invariant(next.multiplier === -1)
            item.position = 1 - (nextPosition - 1)
          }
          next.belt.items.unshift(item)
          remove.add(item)
        } else {
          item.position = 1
        }
      } else if (nextPosition < 0) {
        if (prev) {
          if (prev.multiplier === 1) {
            item.position = nextPosition + 1
          } else {
            item.position = 1 - (nextPosition + 1)
          }
          prev.belt.items.push(item)
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
  next: { belt: Belt; multiplier: number } | null
  prev: { belt: Belt; multiplier: number } | null
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

function* iterateBeltItems(path: BeltPath) {
  const first = path.at(0)
  if (!first) return

  if (first.belt.velocity > 0) {
    let prevAbsolutePosition = path.length

    for (let i = path.length - 1; i >= 0; i--) {
      const belt = path[i]?.belt
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
  } else if (first.belt.velocity < 0) {
    let prevAbsolutePosition = 0

    for (let i = 0; i < path.length; i++) {
      const belt = path[i]?.belt
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

type BeltPath = Array<{
  belt: Belt
  multiplier: number
}>

function getPaths(world: World): Array<BeltPath> {
  const belts = Object.values(world.entities).filter(isBelt)

  const paths = new Array<BeltPath>()
  const seen = new Set<Belt>()

  for (const root of belts) {
    if (seen.has(root)) continue

    const path = new Array<{
      belt: Belt
      multiplier: number
    }>({ belt: root, multiplier: 1 })

    const stack = new Array<{
      belt: Belt
      multiplier: number
    }>({
      belt: root,
      multiplier: 1,
    })

    while (stack.length) {
      const current = stack.pop()
      invariant(current)
      seen.add(current.belt)

      for (const connection of current.belt.connections) {
        if (connection.type !== ConnectionType.enum.Belt)
          continue
        const neighbor = world.entities[connection.entityId]
        invariant(isBelt(neighbor))
        if (seen.has(neighbor)) continue
        const multiplier =
          current.multiplier * connection.multiplier
        stack.push({
          belt: neighbor,
          multiplier,
        })

        invariant(multiplier === 1 || multiplier === -1)

        let add: typeof path.push | typeof path.unshift
        if (
          neighbor.position.y === current.belt.position.y
        ) {
          if (
            neighbor.position.x ===
            current.belt.position.x + 1
          ) {
            if (multiplier === 1) {
              add = path.push.bind(path)
            } else {
              add = path.unshift.bind(path)
            }
          } else {
            invariant(
              neighbor.position.x ===
                current.belt.position.x - 1,
            )
            if (multiplier === 1) {
              add = path.unshift.bind(path)
            } else {
              add = path.push.bind(path)
            }
          }
        } else {
          invariant(
            neighbor.position.x === current.belt.position.x,
          )
          if (
            neighbor.position.y ===
            current.belt.position.y + 1
          ) {
            if (multiplier === 1) {
              add = path.push.bind(path)
            } else {
              add = path.unshift.bind(path)
            }
          } else {
            invariant(
              neighbor.position.y ===
                current.belt.position.y - 1,
            )
            if (multiplier === 1) {
              add = path.unshift.bind(path)
            } else {
              add = path.push.bind(path)
            }
          }
        }

        add({
          belt: neighbor,
          multiplier: connection.multiplier,
        })
      }
    }
    paths.push(path)
  }

  return paths
}
