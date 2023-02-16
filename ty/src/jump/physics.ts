import { Milliseconds } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export interface UpdateArgs {
  elapsed: Milliseconds
}

const toSeconds = (ms: Milliseconds) => ms / 1000

export function addBall() {
  if (!state.drag?.b) throw Error('this should only be called if drag is valid')

  const p = new Vec2(state.viewport.w / 2, state.viewport.h)
  const ab = state.drag.a.sub(state.drag.b)
  const v = ab.norm().mul(ab.length() * 6)
  const r = Math.floor(Math.min(state.viewport.w, state.viewport.h) * 0.05)
  state.ball = { p, v, r }
  console.debug('adding ball')
}

export function update({ elapsed }: UpdateArgs) {
  const { ball } = state
  if (ball) {
    ball.p = ball.p.add(ball.v.mul(toSeconds(elapsed)))
    let captured = false

    let a = new Vec2(0, 6 * 1000)
    let friction = 1

    for (const target of state.targets) {
      const dist = target.p.sub(ball.p).length()
      if (dist < target.r * 3 + ball.r) {
        a = a.add(
          target.p
            .sub(ball.p)
            .mul(1000)
            .mul(1 - dist / (target.r * 3 + ball.r)),
        )

        // slow the ball down as it gets closer to the target
        friction = Math.sqrt(dist / (target.r * 3 + ball.r))
        break
      }
    }

    if (!captured) {
      ball.v = ball.v.add(a.mul(toSeconds(elapsed))).mul(friction)

      if (
        ball.p.y - ball.r > state.viewport.h ||
        ball.p.y + ball.r < 0 ||
        ball.p.x - ball.r > state.viewport.w ||
        ball.p.x + ball.r < 0
      ) {
        state.ball = null
        console.debug('removing ball')
      }
    }
  }
}
