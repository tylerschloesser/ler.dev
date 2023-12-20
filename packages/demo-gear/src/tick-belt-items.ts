import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  Belt,
  BeltDirection,
  BeltEntity,
  BeltPath,
  EntityType,
  ItemType,
  World,
} from './types.js'
import { getEntity, isBelt } from './util.js'

export function tickBeltItems(
  world: World,
  elapsed: number,
): void {
  for (const path of Object.values(world.paths)) {
    const rootId = path.beltIds.at(0)
    invariant(rootId)
    const root = world.entities[rootId]
    invariant(root)

    const dp = root.velocity * elapsed

    if (dp > 0) {
      for (let i = path.items.length - 1; i >= 0; i--) {
        const item = path.items[i]
        invariant(item)

        let available: number
        const next = path.items[i + 1]
        if (next) {
          available = next.position - item.position
        } else {
          available = path.beltIds.length - item.position
        }
        invariant(available >= BELT_ITEM_GAP)
        if (available > BELT_ITEM_GAP) {
          item.position += Math.min(available, dp)
        }
      }
    } else if (dp < 0) {
      for (let i = 0; i < path.items.length; i++) {
        const item = path.items[i]
        invariant(item)

        let available: number
        const prev = path.items[i - 1]
        if (prev) {
          available = prev.position - item.position
        } else {
          available = 0 - item.position
        }
        invariant(-available >= BELT_ITEM_GAP)
        if (-available > BELT_ITEM_GAP) {
          item.position += Math.max(available, dp)
        }
      }
    }

    if (dp !== 0) {
      const seen = new Set<Belt>()

      for (const item of path.items) {
        const beltIndex = Math.floor(item.position)
        const beltId = path.beltIds[beltIndex]
        invariant(beltId)
        const belt = world.entities[beltId]
        invariant(belt?.type === EntityType.enum.Belt)

        if (!seen.has(belt)) {
          belt.items = []
          seen.add(belt)
        }

        belt.items.push({
          type: item.type,
          position: item.position - beltIndex,
        })
      }
    }
  }

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

function updateBeltPathItems(
  world: World,
  path: BeltPath,
): void {
  path.items = []

  for (let i = 0; i < path.beltIds.length; i++) {
    const beltId = path.beltIds.at(i)
    invariant(beltId)
    const belt = world.entities[beltId]
    invariant(belt?.type === EntityType.enum.Belt)

    for (const item of belt.items) {
      path.items.push({
        type: item.type,
        position: i + item.position,
      })
    }
  }
}

export function addResourceToBelt(
  world: World,
  belt: BeltEntity,
  type: ItemType,
): void {
  let index = 0
  for (let i = 0; i < belt.items.length; i++) {
    const item = belt.items[i]
    invariant(item)
    const dp = Math.abs(item.position - 0.5)
    if (dp <= BELT_ITEM_GAP / 2) {
      console.log('no room for item')
      return
    }
    if (item.position < 0.5) {
      index = i
    }
  }

  belt.items.splice(index, 0, { type, position: 0.5 })

  const path = world.paths[belt.pathId]
  invariant(path)

  updateBeltPathItems(world, path)
}
