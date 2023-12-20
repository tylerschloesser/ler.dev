import invariant from 'tiny-invariant'
import { BELT_ITEM_GAP } from './const.js'
import {
  Belt,
  BeltEntity,
  BeltPath,
  EntityType,
  ItemType,
  World,
} from './types.js'

export function tickBeltItems(
  world: World,
  elapsed: number,
): void {
  for (const path of Object.values(world.paths)) {
    const rootId = path.beltIds.at(0)
    invariant(rootId)
    const root = world.entities[rootId]
    invariant(root)

    const dp =
      root.velocity * elapsed * (path.invert ? -1 : 1)

    if (dp > 0) {
      for (let i = path.items.length - 1; i >= 0; i--) {
        const item = path.items[i]
        invariant(item)
        if (path.loop) {
          item.position += dp
          if (item.position > path.beltIds.length) {
            item.position -= path.beltIds.length
          }
        } else {
          let available: number
          const next = path.items[i + 1]
          if (next) {
            available = next.position - item.position
          } else {
            available = path.beltIds.length - item.position
          }
          available -= BELT_ITEM_GAP
          invariant(available >= 0)
          item.position += Math.min(available, dp)
        }
        invariant(item.position >= 0)
        invariant(item.position <= path.beltIds.length)
      }
    } else if (dp < 0) {
      for (let i = 0; i < path.items.length; i++) {
        const item = path.items[i]
        invariant(item)
        if (path.loop) {
          item.position += dp
          if (item.position < 0) {
            item.position += path.beltIds.length
          }
        } else {
          let available: number
          const prev = path.items[i - 1]
          if (prev) {
            available = prev.position - item.position
          } else {
            available = 0 - item.position
          }
          available += BELT_ITEM_GAP
          invariant(available <= 0)
          item.position += Math.max(available, dp)
        }
        invariant(item.position >= 0)
        invariant(item.position <= path.beltIds.length)
      }
    }

    if (dp !== 0) {
      const seen = new Set<Belt>()

      for (const beltId of path.beltIds) {
        const belt = world.entities[beltId]
        invariant(belt?.type === EntityType.enum.Belt)
        belt.items = []
      }

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
