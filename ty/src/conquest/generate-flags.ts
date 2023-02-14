import { Vec2 } from '../common/vec2'
import { addFlag, state } from './state'
import { Color } from './types'

const COLORS: Color[] = ['red', 'green', 'blue']

// min space between each flag
const BUFFER = 20

export function generateFlags() {
  const count = Math.ceil(
    Math.sqrt(state.world.size.x * state.world.size.y) * 0.05,
  )

  let misses = 0

  for (let i = 0; i < count; i++) {
    do {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const r = 10 + Math.floor(Math.random() * 40)
      const p = new Vec2(
        Math.random() * state.world.size.x,
        Math.random() * state.world.size.y,
      )

      if (
        [
          // super ineffecient, fight me
          new Vec2(0, 0),
          new Vec2(state.world.size.x, 0),
          new Vec2(-state.world.size.x, 0),
          new Vec2(0, state.world.size.y),
          new Vec2(0, -state.world.size.y),
          new Vec2(state.world.size.x, state.world.size.y),
          new Vec2(-state.world.size.x, -state.world.size.y),
        ].every((modifier) =>
          state.world.flags.every((flag) => {
            const dist = flag.p.sub(p.add(modifier)).length()
            return dist - flag.r - r - BUFFER > 0
          }),
        )
      ) {
        addFlag({ color, r, p })
        break
      } else {
        misses++
      }
    } while (true)
  }

  console.debug(`Generated ${count} flags with ${misses} misses`)
}
