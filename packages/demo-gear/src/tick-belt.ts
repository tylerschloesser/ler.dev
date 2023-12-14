import invariant from 'tiny-invariant'
import { Belt, EntityType, World } from './types.js'

export function tickBelt(
  world: World,
  belt: Belt,
  elapsed: number,
): void {
  const remove = new Array<number>()
  for (let i = 0; i < belt.items.length; i++) {
    const item = belt.items.at(0)
    invariant(item)

    invariant(item.position >= 0)
    invariant(item.position <= 1)

    const nextPosition =
      item.position + belt.velocity * elapsed

    if (nextPosition > 1) {
      const next = getNextBelt(world, belt)
      if (next) {
        item.position = nextPosition - 1
        next.items.unshift(item)
        remove.push(i)
      } else {
        item.position = 1
      }
    } else if (nextPosition < 0) {
      const prev = getPrevBelt(world, belt)
      if (prev) {
        item.position = nextPosition + 1
        prev.items.push(item)
        remove.push(i)
      } else {
        item.position = 0
      }
    } else {
      item.position = nextPosition
    }
  }

  for (const i of remove) {
    invariant(i < belt.items.length)
    belt.items.splice(i, 1)
  }
}

function getNextBelt(
  world: World,
  belt: Belt,
): Belt | null {
  if (belt.type === EntityType.enum.BeltIntersection) {
    // TODO
    return null
  }

  if (belt.direction === 'x') {
    const tileId = `${belt.position.x + 1}.${
      belt.position.y
    }`
    const tile = world.tiles[tileId]
    if (!tile?.entityId) return null
    const entity = world.entities[tile.entityId]
    invariant(entity)
    if (entity.type !== EntityType.enum.Belt) {
      return null
    }
    if (entity.direction !== 'x') {
      return null
    }
    return entity
  }

  return null
}

function getPrevBelt(
  world: World,
  belt: Belt,
): Belt | null {
  return null
}
