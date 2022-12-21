import { scale, state } from './state'

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
    const target = state.targets[i]

    if (i < state.targets.length - 1) {
      const next = state.targets[i + 1]
      context.beginPath()
      context.strokeStyle = 'hsl(120, 60%, 20%)'
      context.lineWidth = 4
      context.moveTo(transform.x(target.p.x), transform.y(target.p.y))
      context.lineTo(transform.x(next.p.x), transform.y(next.p.y))
      context.stroke()
      context.closePath()
    }

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
  }
}

export function renderDrag({ context }: RenderArgs) {
  const { drag } = state
  if (drag?.b) {
    context.strokeStyle = 'hsl(240, 60%, 80%)'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(drag.a.x, drag.a.y)
    context.lineTo(drag.b.x, drag.b.y)
    context.stroke()
    context.closePath()
  }
}
