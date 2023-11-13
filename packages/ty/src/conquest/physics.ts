import { Milliseconds } from '../common/engine/index.js'
import { Vec2 } from '../common/vec2.js'
import { state } from './state.js'
import { State } from './types.js'

const toSeconds = (ms: Milliseconds) => ms / 1000

interface UpdateArgs {
  timestamp: Milliseconds
  elapsed: Milliseconds
}

export function update(args: UpdateArgs) {
  updateBallPosition(args)
  state.closestFlagInfo = findClosestFlagInfo()
  updateClosestFlagProgress(args)
}

function updateClosestFlagProgress(args: UpdateArgs) {
  if (!state.closestFlagInfo) return
  const { elapsed } = args
  const { index } = state.closestFlagInfo
  const { progress } = state.world.flags[index]!
  state.world.flags[index]!.progress = Math.min(
    1,
    progress + toSeconds(elapsed),
  )
}

function updateBallPosition(args: UpdateArgs) {
  const { elapsed } = args
  state.ball.p = state.ball.p.add(state.ball.v.mul(toSeconds(elapsed)))

  if (state.ball.p.x < 0) {
    state.ball.p.x = state.world.size.x + state.ball.p.x
  }
  if (state.ball.p.y < 0) {
    state.ball.p.y = state.world.size.y + state.ball.p.y
  }
  if (state.ball.p.x >= state.world.size.x) {
    state.ball.p.x = state.ball.p.x - state.world.size.x
  }
  if (state.ball.p.y >= state.world.size.y) {
    state.ball.p.y = state.ball.p.y - state.world.size.y
  }
}

function findClosestFlagInfo(): State['closestFlagInfo'] {
  let closest: { index: number; dist: number; modifier: Vec2 } | null = null

  for (const modifier of [
    new Vec2(0, 0),
    new Vec2(state.world.size.x, 0),
    new Vec2(-state.world.size.x, 0),
    new Vec2(0, state.world.size.y),
    new Vec2(0, -state.world.size.y),
    new Vec2(state.world.size.x, state.world.size.y),
    new Vec2(state.world.size.x, -state.world.size.y),
    new Vec2(-state.world.size.x, state.world.size.y),
    new Vec2(-state.world.size.x, -state.world.size.y),
  ]) {
    for (let i = 0; i < state.world.flags.length; i++) {
      const flag = state.world.flags[i]!
      const dist = state.ball.p.sub(modifier.add(flag.p)).length()
      if (dist < (closest?.dist ?? Number.POSITIVE_INFINITY)) {
        closest = { index: i, dist, modifier }
      }
    }
  }
  return closest
}
