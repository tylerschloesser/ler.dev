import { Belt, World } from './types.js'
import { clamp } from './util.js'

export function tickBelt(
  world: World,
  belt: Belt,
  elapsed: number,
): void {
  for (const item of belt.items) {
    item.position = clamp(
      item.position + belt.velocity * elapsed,
      0,
      1,
    )
  }
}
