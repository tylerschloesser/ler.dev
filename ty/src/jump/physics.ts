import { Milliseconds } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'
import { TargetIndex } from './types'

export interface UpdateArgs {
  elapsed: Milliseconds
}

const toSeconds = (ms: Milliseconds) => ms / 1000

export function addBall() {
  if (!state.drag?.b) throw Error('this should only be called if drag is valid')

  const p = new Vec2(state.viewport.w / 2, 0)
  const ab = state.drag.a.sub(state.drag.b)
  const v = ab.norm().mul(ab.length() * 6)
  const r = Math.floor(Math.min(state.viewport.w, state.viewport.h) * 0.05)
  state.ball = { p, v, r, capturedBy: null }
  console.debug('adding ball', JSON.stringify(state.ball))
}

export function update({ elapsed }: UpdateArgs) {
  const { ball } = state
  if (ball) {
    ball.p = ball.p.add(ball.v.mul(toSeconds(elapsed)))
    let capturedBy: TargetIndex | null = null

    let a = new Vec2(0, 6 * 1000)
    let friction = 1

    for (let i = 0; i < state.targets.length; i++) {
      const target = state.targets[i]
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
        capturedBy = i
        break
      }
    }

    state.ball!.capturedBy = capturedBy

    ball.v = ball.v.add(a.mul(toSeconds(elapsed))).mul(friction)

    if (
      ball.p.y > 0 ||
      ball.p.x - ball.r > state.viewport.w ||
      ball.p.x + ball.r < 0
    ) {
      state.ball = null
      console.debug('removing ball')
    }
  }

  updateCamera({ elapsed })
}

function updateCamera({ elapsed }: UpdateArgs) {
  if (state.ball && state.ball.capturedBy !== null) {
    const target = state.targets[state.ball.capturedBy]
    const destination = new Vec2(state.viewport.w, state.viewport.h)
      .div(2)
      .mul(-1)
      .add(target.p)

    let v = destination.sub(state.ball.p)
    v = v.norm().mul(Math.min(v.length(), 100))

    state.camera.v = v
    state.camera.p = state.camera.p.add(state.camera.v.mul(toSeconds(elapsed)))
  }
}
