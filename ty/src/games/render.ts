import { detectCollisions, moveBall, moveTargets } from './physics'
import { scale, state, viewport } from './state'
import { Vec2 } from './vec2'

export interface RenderArgs {
  context: CanvasRenderingContext2D
  transform: {
    x(x1: number): number
    y(y1: number): number
  }
}

export function renderWorld({ context, transform }: RenderArgs) {
  const { world } = state

  {
    context.beginPath()
    context.strokeStyle = 'hsl(0, 0%, 30%)'
    context.lineWidth = 1
    const size = 100
    for (let i = 1; i < world.w / size; i++) {
      context.moveTo(transform.x(i * size), transform.y(0))
      context.lineTo(transform.x(i * size), transform.y(world.h))

      context.moveTo(transform.x(0), transform.y(i * size))
      context.lineTo(transform.x(world.w), transform.y(i * size))
    }

    context.stroke()
    context.closePath()
  }

  {
    context.beginPath()
    context.strokeStyle = 'hsl(0, 0%, 70%)'
    context.lineWidth = 1
    context.moveTo(transform.x(0), transform.y(0))
    ;[
      [world.w, 0],
      [world.w, world.h],
      [0, world.h],
      [0, 0],
    ].forEach(([x, y]) => {
      context.lineTo(transform.x(x), transform.y(y))
    })
    context.stroke()
    context.closePath()
  }
}

export function renderBall({ context, transform }: RenderArgs) {
  if (state.ball) {
    context.beginPath()
    context.fillStyle = 'hsl(0, 60%, 50%)'
    context.arc(
      transform.x(state.ball.p.x),
      transform.y(state.ball.p.y),
      state.ball.r * scale,
      0,
      Math.PI * 2,
    )
    context.fill()
    context.closePath()
  }
}

export function renderTargets({ context, transform }: RenderArgs) {
  for (let i = 0; i < state.targets.length; i++) {
    const pair = state.targets[i]

    context.beginPath()
    context.strokeStyle = 'hsl(120, 60%, 20%)'
    context.lineWidth = 4
    context.moveTo(transform.x(pair[0].p.x), transform.y(pair[0].p.y))
    context.lineTo(transform.x(pair[1].p.x), transform.y(pair[1].p.y))
    context.stroke()
    context.closePath()

    pair.forEach((target) => {
      context.beginPath()
      context.fillStyle = 'hsl(120, 60%, 50%)'

      if (target.hit) {
        context.fillStyle = 'hsl(120, 60%, 20%)'
      }

      context.arc(
        transform.x(target.p.x),
        transform.y(target.p.y),
        target.r * scale,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.closePath()
    })
  }
}

export function renderDrag({ context, transform }: RenderArgs) {
  const { drag } = state
  if (drag?.b) {
    context.strokeStyle = 'hsl(240, 60%, 80%)'
    context.lineWidth = 2
    context.beginPath()
    const end = state.ball.p.add(drag.b.sub(drag.a).mul(-1))
    context.moveTo(transform.x(state.ball.p.x), transform.y(state.ball.p.y))
    context.lineTo(transform.x(end.x), transform.y(end.y))
    context.stroke()
    context.closePath()
  }
}

export function buildRender(context: CanvasRenderingContext2D) {
  let last: null | number = null
  return function render(time: number) {
    let elapsed = (last ? time - last : 0) / 1000
    last = time

    const { w, h } = viewport
    context.clearRect(0, 0, w, h)
    context.fillStyle = 'hsl(0, 0%, 20%)'
    context.fillRect(0, 0, w, h)

    moveTargets(elapsed)
    moveBall(elapsed)
    detectCollisions()

    const translate = new Vec2(
      viewport.w / 2 -
        (state.world.w * scale) / 2 +
        (state.world.w / 2 - state.ball.p.x) * scale,
      viewport.h / 2 -
        (state.world.h * scale) / 2 +
        (state.world.h / 2 - state.ball.p.y) * scale,
    )

    const transform = {
      x: (x1: number) => x1 * scale + translate.x,
      y: (y1: number) => y1 * scale + translate.y,
    }
    const args: RenderArgs = {
      context,
      transform,
    }

    renderWorld(args)
    renderTargets(args)
    renderBall(args)
    renderDrag(args)

    window.requestAnimationFrame(render)
  }
}
