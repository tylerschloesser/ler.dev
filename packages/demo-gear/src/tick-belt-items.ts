import invariant from 'tiny-invariant'
import {
  BeltEntity,
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
          if (right.velocity >= 0) {
            path.push(right)
          } else {
            path.unshift(right)
          }
        }
        const left = getBeltLeft(world, current)
        if (left && !seen.has(left)) {
          stack.push(left)
          if (left.velocity >= 0) {
            path.unshift(left)
          } else {
            path.push(left)
          }
        }
      } else {
        invariant(current.direction === 'y')
        // TODO
      }
    }
    paths.push(path)
  }

  for (const path of paths) {
    for (let i = path.length - 1; i >= 0; i--) {
      const belt = path.at(i)
      invariant(belt)

      const remove = new Array<number>()
      for (let j = 0; j < belt.items.length; j++) {
        const item = belt.items[j]
        invariant(item)

        const nextPosition =
          item.position + belt.velocity * elapsed
        if (nextPosition > 1) {
          const next = path[i + 1]
          if (next) {
            item.position = nextPosition - 1
            next.items.unshift(item)
            remove.push(j)
          } else {
            item.position = 1
          }
        } else if (nextPosition < 0) {
          const prev = path[i - 1]
          if (prev) {
            item.position = nextPosition + 1
            prev.items.push(item)
            remove.push(j)
          } else {
            item.position = 0
          }
        } else {
          item.position = nextPosition
        }
      }

      for (const j of remove) {
        invariant(j < belt.items.length)
        belt.items.splice(j, 1)
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
