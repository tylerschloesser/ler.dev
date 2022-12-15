import React, { useEffect, useState } from 'react'

class Vec2 {
  x: number
  y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2): Vec2 {
    return this.add(v.mul(-1))
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }
}

interface Drag {
  a: Vec2
  b?: Vec2
}

interface Ball {
  p: Vec2
  v: Vec2
}

interface State {
  ball?: Ball
  drag?: Drag
}

const state: State = {}

interface RenderArgs {
  context: CanvasRenderingContext2D
}

function renderGrid({ context }: RenderArgs) {
  context.beginPath()
  context.strokeStyle = 'hsl(0, 0%, 30%)'
  context.lineWidth = 1
  const s = Math.min(window.innerHeight, window.innerWidth) * 0.1
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      context.moveTo(i * s, 0)
      context.lineTo(i * s, 100 * s)

      context.moveTo(0, j * s)
      context.lineTo(100 * s, j * s)
    }
  }
  context.stroke()
  context.closePath()
}

function renderBall({ context }: RenderArgs) {
  if (state.ball) {
    context.fillStyle = 'hsl(0, 60%, 50%)'
    const radius = Math.min(window.innerHeight, window.innerWidth) * 0.05
    context.arc(
      window.innerWidth / 2,
      window.innerHeight / 2,
      radius,
      0,
      Math.PI * 2,
    )
    context.fill()
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
  if (ball) {
    ball.p = ball.p.add(ball.v.mul(elapsed))
  }
}

function buildRender(args: RenderArgs) {
  let last: null | number = null
  return function render(time: number) {
    let elapsed = (last ? time - last : 0) / 1000
    last = time

    const { context } = args
    const w = window.innerWidth
    const h = window.innerHeight
    context.clearRect(0, 0, w, h)
    context.fillStyle = 'hsl(0, 0%, 20%)'
    context.fillRect(0, 0, w, h)

    moveBall(elapsed)

    const { ball } = state
    context.translate(-(ball?.p.x ?? 0), -(ball?.p.y ?? 0))
    renderGrid(args)
    context.resetTransform()

    renderBall(args)
    renderDrag(args)

    window.requestAnimationFrame(render)
  }
}

function initBall() {
  state.ball = {
    p: new Vec2(window.innerWidth / 2, window.innerHeight / 2),
    v: new Vec2(10, -5),
  }
}

function initCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const context = canvas.getContext('2d')!

  initInput(canvas)
  initBall()

  window.requestAnimationFrame(buildRender({ context }))
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
    if (state.drag && state.ball) {
      state.drag.b = new Vec2(e.clientX, e.clientY)
      state.ball.v = state.drag.a.sub(state.drag.b!)
      delete state.drag
    }
  })
  canvas.addEventListener('pointerleave', () => {
    delete state.drag
  })
}

export function Games() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    canvas && initCanvas(canvas)
  }, [canvas])
  return (
    <div>
      <canvas ref={setCanvas} />
    </div>
  )
}
