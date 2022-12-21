import { addTargetPair, state, Target } from './state'

export function moveTargets(elapsed: number) {
  state.targets.flat().forEach((target) => {
    const p2 = target.p.add(target.v.mul(elapsed))
    target.p = p2
  })
}

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
    state.targets.forEach((pair) => {
      pair[0].hit = false
      pair[1].hit = false
    })
  }

  ball.p = p2
}

export function detectCollisions() {
  let targets2: [Target, Target][] = []

  for (const pair of state.targets) {
    pair.forEach((target) => {
      let dist = target.p.sub(state.ball.p).length()
      if (dist - target.r - state.ball.r < 0) {
        target.hit = true
      }
    })
    if (pair.every((target) => target.hit)) {
      addTargetPair(targets2)
    } else {
      targets2.push(pair)
    }
  }
  state.targets = targets2
}
