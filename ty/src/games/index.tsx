import React, { useEffect, useState } from 'react'
import { state, Target } from './state'
import { Vec2 } from './vec2'

// IDEAS
// two balls, input controls both balls

interface Viewport {
  w: number
  h: number
}

let viewport: Viewport = {
  w: window.innerWidth,
  h: window.innerHeight,
}

function minScale() {
  let padding = Math.min(state.world.w, state.world.h) * 0.1
  return Math.min(
    viewport.w / (state.world.w + padding),
    viewport.h / (state.world.h + padding),
  )
}

let scale = minScale()

function adjustScale(dy: number) {
  scale = Math.max(minScale(), scale + dy * 0.001)
}

interface RenderArgs {
  context: CanvasRenderingContext2D
  transform: {
    x(x1: number): number
    y(y1: number): number
  }
}

function renderWorld({ context, transform }: RenderArgs) {
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

function renderBall({ context, transform }: RenderArgs) {
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

function renderTargets({ context, transform }: RenderArgs) {
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

function renderDrag({ context }: RenderArgs) {
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

function moveBall(elapsed: number) {
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

function detectCollisions() {
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

function buildRender(context: CanvasRenderingContext2D) {
  let last: null | number = null
  return function render(time: number) {
    let elapsed = (last ? time - last : 0) / 1000
    last = time

    const { w, h } = viewport
    context.clearRect(0, 0, w, h)
    context.fillStyle = 'hsl(0, 0%, 20%)'
    context.fillRect(0, 0, w, h)

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

function handleResize(canvas: HTMLCanvasElement) {
  viewport = {
    w: window.innerWidth,
    h: window.innerHeight,
  }

  canvas.width = viewport.w
  canvas.height = viewport.h
}

function initCanvas(canvas: HTMLCanvasElement) {
  canvas.width = viewport.w
  canvas.height = viewport.h

  const context = canvas.getContext('2d')!

  initInput(canvas)

  window.requestAnimationFrame(buildRender(context))
}

function initInput(canvas: HTMLCanvasElement) {
  canvas.addEventListener('pointerdown', (e) => {
    state.drag = {
      a: new Vec2(e.clientX, e.clientY),
    }
  })

  canvas.addEventListener('pointermove', (e) => {
    if (state.drag) {
      state.drag.b = new Vec2(e.clientX, e.clientY)
    }
  })

  canvas.addEventListener('pointerup', (e) => {
    if (state.drag) {
      state.drag.b = new Vec2(e.clientX, e.clientY)
      state.ball.v = state.drag.a.sub(state.drag.b!).mul(2)
      state.targets.forEach((target) => {
        target.hit = false
      })
      delete state.drag
    }
  })
  canvas.addEventListener('pointerleave', () => {
    delete state.drag
  })

  canvas.addEventListener('wheel', (e) => {
    adjustScale(-e.deltaY)
  })
}

function addTarget(targets: Target[]) {
  let p: Vec2
  const padding = Math.min(state.world.w, state.world.h) * 0.1
  while (true) {
    p = new Vec2(Math.random() * state.world.w, Math.random() * state.world.h)
    if (
      p.x < padding ||
      state.world.w - p.x < padding ||
      p.y < padding ||
      state.world.h - p.y < padding
    ) {
      continue
    }

    // ensure it's not too close to other targets
    if (
      targets.some((other) => {
        return other.p.sub(p).length() < padding
      })
    ) {
      continue
    }

    const dist = state.ball.p.sub(p).length()
    if (dist > padding) {
      break
    }
  }

  targets.push({ p, r: 20, hit: false })
}

function initTargets() {
  addTarget(state.targets)
  addTarget(state.targets)
}

export function Games() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    if (canvas) {
      initTargets()
      initCanvas(canvas)
      const ro: ResizeObserver = new ResizeObserver(() => {
        handleResize(canvas)
      })
      ro.observe(document.body)
    }

    // prevent scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [canvas])
  return (
    <div>
      <canvas ref={setCanvas} />
    </div>
  )
}
