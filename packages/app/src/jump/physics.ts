import { Milliseconds } from '../common/engine/index.js'
import { Vec2 } from '../common/vec2.js'
import { state } from './state.js'
import { TargetIndex } from './types.js'

export interface UpdateArgs {
  elapsed: Milliseconds
}

const toSeconds = (ms: Milliseconds) => ms / 1000

export function launchBall() {
  if (!state.drag?.b)
    throw Error(
      'this should only be called if drag is valid',
    )

  if (state.ball === null) {
    const p = new Vec2(state.viewport.w / 2, 0)
    const r = Math.floor(
      Math.min(state.viewport.w, state.viewport.h) * 0.05,
    )
    state.ball = {
      p,
      v: new Vec2(0, 0),
      r,
      capturedBy: null,
      launchedBy: null,
    }
  } else {
    state.ball.launchedBy = state.ball.capturedBy
    state.ball.capturedBy = null
  }

  const ab = state.drag.a.sub(state.drag.b)
  state.ball.v = ab.norm().mul(ab.length() * 6)

  console.log('launching ball')
}

export function update({ elapsed }: UpdateArgs) {
  const { ball } = state
  if (ball) {
    ball.p = ball.p.add(ball.v.mul(toSeconds(elapsed)))
    let capturedBy: TargetIndex | null = null

    let a = new Vec2(0, 6 * 1000)
    let friction = 1

    for (let i = 0; i < state.targets.length; i++) {
      // TODO unset launchedBy when we get far enough away
      if (ball.launchedBy === i) continue

      const target = state.targets[i]!
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

    ball.v = ball.v
      .add(a.mul(toSeconds(elapsed)))
      .mul(friction)

    if (ball.p.y > 0) {
      state.ball = null
      console.debug('removing ball')
    }
  }

  updateCamera({ elapsed })
}

function updateCamera({ elapsed }: UpdateArgs) {
  let destination: Vec2
  if (state.ball && state.ball.capturedBy !== null) {
    const target = state.targets[state.ball.capturedBy]!
    destination = target.p.sub(
      new Vec2(
        state.viewport.w / 2,
        state.viewport.h * 0.66,
      ),
    )
  } else if (!state.ball) {
    destination = new Vec2(0, -state.viewport.h)
  } else {
    // do nothing
    return
  }

  let v = destination.sub(state.camera.p)
  v = v.norm().mul(Math.pow(v.length(), 1.4))

  state.camera.v = v
  state.camera.p = state.camera.p.add(
    v.mul(toSeconds(elapsed)),
  )
}
