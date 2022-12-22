import { addTargetPair, state, Target } from './state'
import { Vec2 } from './vec2'

function handleWallCollision(
  p2: Vec2,
  obj: {
    v: Vec2
    r: number
  },
) {
  let hit = false
  if (p2.x - obj.r < 0) {
    p2.x = (p2.x - obj.r) * -1 + obj.r
    obj.v.x *= -1
    hit = true
  } else if (p2.x + obj.r > state.world.w) {
    p2.x -= p2.x + obj.r - state.world.w
    obj.v.x *= -1
    hit = true
  }

  if (p2.y - obj.r < 0) {
    p2.y = (p2.y - obj.r) * -1 + obj.r
    obj.v.y *= -1
    hit = true
  } else if (p2.y + obj.r > state.world.h) {
    p2.y -= p2.y + obj.r - state.world.h
    obj.v.y *= -1
    hit = true
  }
  return hit
}

export function moveTargets(elapsed: number) {
  state.targets.flat().forEach((target) => {
    const p2 = target.p.add(target.v.mul(elapsed))
    handleWallCollision(p2, target)
    target.p = p2
  })

  state.targets.forEach((pair) => {
    if (pair[0].p.sub(pair[1].p).length() > 300) {
      // randomly reverse one of the targets
      const target = pair[Math.floor(Math.random() * 2)]
      target.v = target.v.mul(-1)
      const p2 = target.p.add(target.v.mul(elapsed * 2))
      handleWallCollision(p2, target)
      target.p = p2
    }
  })
}

export function moveBall(elapsed: number) {
  const { ball } = state

  const p2 = ball.p.add(ball.v.mul(elapsed))

  let hitWall = handleWallCollision(p2, ball)

  if (hitWall) {
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
