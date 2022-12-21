import { addTarget, state, Target } from './state'

export function moveBall(elapsed: number) {
  const { ball } = state

  const p2 = ball.p.add(ball.v.mul(elapsed))

  let hit = false

  if (p2.x - ball.r < 0) {
    p2.x = (p2.x - ball.r) * -1 + ball.r
    ball.v.x *= -1
    hit = true
  } else if (p2.x + ball.r > state.world.w) {
    p2.x -= p2.x + ball.r - state.world.w
    ball.v.x *= -1
    hit = true
  }

  if (p2.y - ball.r < 0) {
    p2.y = (p2.y - ball.r) * -1 + ball.r
    ball.v.y *= -1
    hit = true
  } else if (p2.y + ball.r > state.world.h) {
    p2.y -= p2.y + ball.r - state.world.h
    ball.v.y *= -1
    hit = true
  }

  if (hit) {
    state.targets.forEach((target) => {
      target.hit = false
    })
  }

  ball.p = p2
}

export function detectCollisions() {
  let targets2: Target[] = []

  for (const target of state.targets) {
    const dist = target.p.sub(state.ball.p).length()
    if (dist - target.r - state.ball.r < 0) {
      if (!target.hit) {
        if (
          state.targets.every((other) => {
            return other === target || other.hit
          })
        ) {
          targets2 = []
          addTarget(targets2)
          addTarget(targets2)
          break
        }
      }

      target.hit = true
      targets2.push(target)
    } else {
      targets2.push(target)
    }
  }
  state.targets = targets2
}
