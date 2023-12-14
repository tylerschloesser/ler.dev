import invariant from 'tiny-invariant'
import { Belt, World } from './types.js'

export function tickBelt(
  world: World,
  belt: Belt,
  elapsed: number,
): void {
  for (const item of belt.items) {
    invariant(item.position >= 0)
    invariant(item.position <= 1)

    const nextPosition =
      item.position + belt.velocity * elapsed

    if (nextPosition > 1) {
      const next = getNextBelt(world, belt)
      if (next) {
      } else {
        item.position = 1
      }
    } else if (nextPosition < 0) {
      const prev = getPrevBelt(world, belt)
      if (prev) {
      } else {
        item.position = 0
      }
    } else {
      item.position = nextPosition
    }
  }
}

function getNextBelt(
  world: World,
  belt: Belt,
): Belt | null {
  return null
}

function getPrevBelt(
  world: World,
  belt: Belt,
): Belt | null {
  return null
}
