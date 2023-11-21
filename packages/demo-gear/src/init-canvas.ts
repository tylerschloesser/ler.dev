import invariant from 'tiny-invariant'
import { zoomToTileSize } from './camera.js'
import { render as renderCpu } from './render-cpu/render.js'
import { AppState, InitFn } from './types.js'

export const initCanvas: InitFn = (state) => {
  const { canvas, signal } = state

  updateViewport(
    state,
    canvas.container.getBoundingClientRect(),
  )
  const ro = new ResizeObserver((entries) => {
    invariant(entries.length === 1)
    const first = entries.at(0)
    invariant(first)
    updateViewport(state, first.contentRect)
  })
  ro.observe(canvas.container)
  signal.addEventListener('abort', () => {
    ro.disconnect()
  })

  const context = canvas.cpu.getContext('2d')

  function handleFrame() {
    if (signal.aborted) {
      return
    }
    invariant(context)
    renderCpu(state, context)
    window.requestAnimationFrame(handleFrame)
  }
  window.requestAnimationFrame(handleFrame)
}

function updateViewport(
  state: AppState,
  rect: DOMRectReadOnly,
): void {
  const vx = rect.width
  const vy = rect.height
  state.viewport.size.x = vx
  state.viewport.size.y = vy

  state.canvas.cpu.width = vx
  state.canvas.cpu.height = vy
  state.canvas.gpu.width = vx
  state.canvas.gpu.height = vy

  state.tileSize = zoomToTileSize(state.camera.zoom, vx, vy)
}
