import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  Belt,
  BeltDirection,
  BeltEntity,
  BeltItem,
  EntityType,
  ItemType,
  World,
} from './types.js'
import { getEntity, isBelt } from './util.js'

export function tickBeltItems(
  world: World,
  elapsed: number,
): void {
  // const paths = getPaths(world)
  // for (const path of paths) {
  //   const first = path.at(0)
  //   invariant(first)
  //   const loop = Boolean(first.prev)
  //   if (loop) {
  //     for (const { belt } of path) {
  //       for (const item of belt.items) {
  //         item.position += belt.velocity * elapsed
  //       }
  //     }
  //     const seen = new Set<BeltItem>()
  //     for (const { belt, next } of path) {
  //       invariant(next)
  //       const remove = new Array<number>()
  //       for (let i = 0; i < belt.items.length; i++) {
  //         const item = belt.items.at(i)
  //         invariant(item)
  //         if (seen.has(item)) continue
  //         seen.add(item)
  //         if (item.position < 0) {
  //           item.position = item.position + 1
  //           next.items.unshift(item)
  //           remove.unshift(i)
  //         } else if (item.position > 1) {
  //           item.position = item.position - 1
  //           next.items.unshift(item)
  //           remove.unshift(i)
  //         }
  //       }
  //       for (const i of remove) {
  //         belt.items.splice(i, 1)
  //       }
  //     }
  //   }
  // }
}

function getBelt(
  world: World,
  x: number,
  y: number,
): BeltEntity | undefined {
  const tileId = `${x}.${y}`
  const tile = world.tiles[tileId]
  if (!tile?.entityId) return undefined
  const entity = getEntity(world, tile.entityId)
  if (entity.type === EntityType.enum.Belt) {
    return entity
  }
  return undefined
}

function getBeltMap(world: World) {
  const belts = new Map<
    Belt,
    {
      belt: Belt
      prev?: Belt
      next?: Belt
    }
  >()

  for (const belt of Object.values(world.entities).filter(
    isBelt,
  )) {
    const { x, y } = belt.position
    let prev: Belt | undefined = undefined
    let next: Belt | undefined = undefined
    switch (belt.direction) {
      case BeltDirection.enum.EastWest: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x - 1, y)
          next = getBelt(world, x + 1, y)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x + 1, y)
          next = getBelt(world, x - 1, y)
        }
        break
      }
      case BeltDirection.enum.NorthSouth: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x, y - 1)
          next = getBelt(world, x, y + 1)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x, y + 1)
          next = getBelt(world, x, y - 1)
        }
        break
      }
      case BeltDirection.enum.NorthWest: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x - 1, y)
          next = getBelt(world, x, y - 1)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x, y - 1)
          next = getBelt(world, x - 1, y)
        }
        break
      }
      case BeltDirection.enum.NorthEast: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x, y - 1)
          next = getBelt(world, x + 1, y)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x + 1, y)
          next = getBelt(world, x, y - 1)
        }
        break
      }
      case BeltDirection.enum.SouthWest: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x - 1, y)
          next = getBelt(world, x, y + 1)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x, y + 1)
          next = getBelt(world, x - 1, y)
        }
        break
      }
      case BeltDirection.enum.SouthEast: {
        if (belt.velocity > 0) {
          prev = getBelt(world, x, y + 1)
          next = getBelt(world, x + 1, y)
        } else if (belt.velocity < 0) {
          prev = getBelt(world, x + 1, y)
          next = getBelt(world, x, y + 1)
        }
        break
      }
    }

    belts.set(belt, { belt, prev, next })
  }
  return belts
}

type BeltPath = Array<{
  belt: Belt
  prev?: Belt
  next?: Belt
}>

function getPaths(world: World): Array<BeltPath> {
  const map = getBeltMap(world)
  const seen = new Set<Belt>()

  const paths = new Array<BeltPath>()

  for (const root of map.keys()) {
    if (seen.has(root)) continue

    let loop = false
    const path: BeltPath = []
    let stack = new Array<Belt>(root)

    while (stack.length) {
      const current = stack.pop()
      invariant(current)

      if (seen.has(current)) {
        loop = true
        break
      }
      seen.add(current)

      const value = map.get(current)
      invariant(value)
      const { next } = value
      if (next) {
        path.push(value)
        stack.push(next)
      }
    }

    if (!loop) {
      seen.delete(root)
      stack = new Array<Belt>(root)

      while (stack.length) {
        const current = stack.pop()
        invariant(current)

        // should not be possible, because we
        // would've detected the loop above
        invariant(!seen.has(current))
        seen.add(current)

        const value = map.get(current)
        invariant(value)
        const { prev } = value
        if (prev) {
          path.unshift(value)
          stack.push(prev)
        }
      }
    }

    paths.push(path)
  }

  return paths
}

export function addResourceToBelt(
  world: World,
  belt: BeltEntity,
  type: ItemType,
): void {
  for (const item of belt.items) {
    const dp = Math.abs(item.position - 0.5)
    if (dp <= BELT_ITEM_GAP / 2) {
      console.log('no room for item')
      return
    }
  }

  belt.items.unshift({ type, position: 0.5 })
}
