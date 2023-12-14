import { Belt, World } from './types.js'
import { clamp } from './util.js'

export function tickBelt(
  world: World,
  belt: Belt,
  elapsed: number,
): void {
  for (const item of belt.items) {
    const nextPosition =
      item.position + belt.velocity * elapsed

    item.position = clamp(nextPosition, 0, 1)
  }
}
