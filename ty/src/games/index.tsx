import React, { useEffect, useState } from 'react'
import { detectCollisions, moveBall } from './physics'
import {
  RenderArgs,
  renderBall,
  renderDrag,
  renderTargets,
  renderWorld,
} from './render'
import {
  addTarget,
  adjustScale,
  scale,
  state,
  updateViewport,
  viewport,
} from './state'
import { Vec2 } from './vec2'

// IDEAS
// two balls, input controls both balls

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
  updateViewport({
    w: window.innerWidth,
    h: window.innerHeight,
  })

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
