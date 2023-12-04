import invariant from 'tiny-invariant'
import { zoomToTileSize } from './camera.js'
import { render } from './render/render.js'
import { initGpuState } from './render/state.js'
import { IAppContext, InitFn } from './types.js'

export const initCanvas: InitFn = async (context) => {
  const { canvas, signal } = context

  updateViewport(
    context,
    canvas.container.getBoundingClientRect(),
  )
  const ro = new ResizeObserver((entries) => {
    invariant(entries.length === 1)
    const first = entries.at(0)
    invariant(first)
    updateViewport(context, first.contentRect)
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
    render(context, gl, gpuState)
    window.requestAnimationFrame(handleFrame)
  }
  window.requestAnimationFrame(handleFrame)
}

function updateViewport(
  context: IAppContext,
  rect: DOMRectReadOnly,
): void {
  const vx = rect.width
  const vy = rect.height
  context.viewport.size.x = vx
  context.viewport.size.y = vy

  const { pixelRatio } = context.viewport

  context.canvas.gpu.width = vx * pixelRatio
  context.canvas.gpu.height = vy * pixelRatio

  context.tileSize = zoomToTileSize(
    context.camera.zoom,
    vx,
    vy,
  )
}
