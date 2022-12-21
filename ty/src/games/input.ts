import { adjustScale, state, updateViewport, viewport } from './state'
import { Vec2 } from './vec2'

export function initInput(canvas: HTMLCanvasElement) {
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

function handleResize(canvas: HTMLCanvasElement) {
  updateViewport({
    w: window.innerWidth,
    h: window.innerHeight,
  })

  canvas.width = viewport.w
  canvas.height = viewport.h
}

export function initResizeObserver(canvas: HTMLCanvasElement): () => void {
  const ro: ResizeObserver = new ResizeObserver(() => {
    handleResize(canvas)
  })
  ro.observe(document.body)
  return () => {
    ro.disconnect()
  }
}
