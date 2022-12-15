import { words } from 'lodash'
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

interface World {
  w: number
  h: number
}

interface State {
  ball: Ball
  drag?: Drag
  world: World
}

const state: State = {
  world: {
    w: 100,
    h: 100,
  },
  ball: {
    p: new Vec2(50, 50),
    v: new Vec2(1, 1),
  },
}

interface RenderArgs {
  context: CanvasRenderingContext2D
}

function renderWorld({ context }: RenderArgs) {
  context.beginPath()

  context.strokeStyle = 'hsl(0, 0%, 30%)'
  context.lineWidth = 1

  const { world } = state

  context.moveTo(0, 0)
  context.lineTo(world.w, 0)
  context.lineTo(world.w, world.h)
  context.lineTo(0, world.h)
  context.lineTo(0, 0)

  context.stroke()
  context.closePath()
}

function renderBall({ context }: RenderArgs) {
  if (state.ball) {
    context.beginPath()
    context.fillStyle = 'hsl(0, 60%, 50%)'
    const radius = Math.min(window.innerHeight, window.innerWidth) * 0.05
    context.arc(state.ball.p.x, state.ball.p.y, radius, 0, Math.PI * 2)
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

  if (p2.x < 0) {
    p2.x *= -1
    ball.v.x *= -1
  } else if (p2.x > state.world.w) {
    p2.x -= p2.x - state.world.w
    ball.v.x *= -1
  }

  if (p2.y < 0) {
    p2.y *= -1
    ball.v.y *= -1
  } else if (p2.y > state.world.h) {
    p2.y -= p2.y - state.world.h
    ball.v.y *= -1
  }

  ball.p = p2
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

    renderWorld(args)

    renderBall(args)
    renderDrag(args)

    window.requestAnimationFrame(render)
  }
}

function initCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const context = canvas.getContext('2d')!

  initInput(canvas)

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
    if (state.drag) {
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
