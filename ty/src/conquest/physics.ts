import { Milliseconds } from '../common/engine'
import { state } from './state'

const toSeconds = (ms: Milliseconds) => ms / 1000

export function update(args: {
  timestamp: Milliseconds
  elapsed: Milliseconds
}) {
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
