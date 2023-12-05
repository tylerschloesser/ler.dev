import { Belt, IAppContext } from '../types.js'
import { Color } from './color.js'
import { batchRenderRect } from './render-rect.js'
import { GpuState } from './types.js'

export function renderBelt(
  _context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  path: Belt['path'],
  color: Color,
) {
  const render = batchRenderRect(gl, gpu, color)

  for (const { x, y } of path) {
    render(x, y, 1, 1)
  }
}
