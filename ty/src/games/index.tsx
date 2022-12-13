import React, { useEffect, useState } from 'react'

let drag: null | { a: Vec2; b?: Vec2 } = null

let ball: null | { p: Vec2; v: Vec2 } = null

interface RenderArgs {
  context: CanvasRenderingContext2D
}

function buildRender(args: RenderArgs) {
  return function render() {
    const { context } = args
    const w = window.innerWidth
    const h = window.innerHeight
    context.clearRect(0, 0, w, h)
    context.fillStyle = 'grey'
    context.fillRect(0, 0, w, h)

    if (drag?.b) {
      context.strokeStyle = 'blue'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(drag.a.x, drag.a.y)
      context.lineTo(drag.b.x, drag.b.y)
      context.stroke()
      context.closePath()
    }

    window.requestAnimationFrame(render)
  }
}

function initBall() {
  ball = {
    p: new Vec2(window.innerWidth / 2, window.innerHeight / 2),
    v: new Vec2(),
  }
}

function initCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')!
  initInput(canvas)
  initBall()

  window.requestAnimationFrame(buildRender({ context }))
}

class Vec2 {
  x: number
  y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }
}

function initInput(canvas: HTMLCanvasElement) {
  canvas.addEventListener('pointerdown', (e) => {
    drag = {
      a: new Vec2(e.clientX, e.clientY),
    }
  })

  canvas.addEventListener('pointermove', (e) => {
    if (drag) {
      drag.b = new Vec2(e.clientX, e.clientY)
    }
  })

  canvas.addEventListener('pointerup', () => {
    drag = null
  })
  canvas.addEventListener('pointerleave', () => {
    drag = null
  })
}

export function Games() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    canvas && initCanvas(canvas)
  }, [canvas])
  return (
    <div>
      <canvas
        ref={setCanvas}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  )
}
