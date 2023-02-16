import { Milliseconds } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export interface UpdateArgs {
  elapsed: Milliseconds
}

const toSeconds = (ms: Milliseconds) => ms / 1000

export function addBall() {
  if (!state.drag?.b) throw Error('this should only be called if drag is valid')

  console.debug('adding ball')

  const p = new Vec2(state.viewport.w / 2, state.viewport.h)
  const ab = state.drag.a.sub(state.drag.b)
  const v = ab.norm().mul(ab.length() * 5)
  state.ball = { p, v }
}

export function update({ elapsed }: UpdateArgs) {
  if (state.ball) {
    const a = new Vec2(0, 5 * 1000)
    state.ball.p = state.ball.p.add(state.ball.v.mul(toSeconds(elapsed)))
    state.ball.v = state.ball.v.add(a.mul(toSeconds(elapsed)))

    if (
      state.ball.p.y > state.viewport.h ||
      state.ball.p.y < 0 ||
      state.ball.p.x > state.viewport.w ||
      state.ball.p.x < 0
    ) {
      state.ball = null
      console.debug('removing ball')
    }
  }
}
