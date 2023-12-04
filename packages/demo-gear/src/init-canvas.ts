import invariant from 'tiny-invariant'
import { zoomToTileSize } from './camera.js'
import { render } from './render/render.js'
import { initGpuState } from './render/state.js'
import { AppState, InitFn } from './types.js'

export const initCanvas: InitFn = async (state) => {
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

  const gl = canvas.gpu.getContext('webgl2')
  invariant(gl)
  const gpuState = await initGpuState(gl)

  function handleFrame() {
    if (signal.aborted) {
      return
    }
    invariant(gl)
    render(state, gl, gpuState)
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

  const { pixelRatio } = state.viewport

  state.canvas.gpu.width = vx * pixelRatio
  state.canvas.gpu.height = vy * pixelRatio

  state.tileSize = zoomToTileSize(state.camera.zoom, vx, vy)
}
