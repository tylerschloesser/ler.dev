import invariant from 'tiny-invariant'
import { Belt, IAppContext } from '../types.js'
import {
  BELT_COLOR,
  BELT_LINE_COLOR,
  Color,
} from './color.js'
import { batchRenderRect } from './render-rect.js'
import { GpuState } from './types.js'

export function renderBelt(
  _context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  path: Belt['path'],
  tint?: Color,
) {
  const render = batchRenderRect(gl, gpu)

  for (const {
    position: { x, y },
    direction,
  } of path) {
    render(x, y, 1, 1, BELT_COLOR)
    if (direction === 'x') {
      render(x + 0.5 - 0.1 / 2, y, 0.1, 1, BELT_LINE_COLOR)
    } else {
      invariant(direction === 'y')
      render(x, y + 0.5 - 0.1 / 2, 1, 0.1, BELT_LINE_COLOR)
    }
    if (tint) {
      render(x, y, 1, 1, tint)
    }
  }
}
