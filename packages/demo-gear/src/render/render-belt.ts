import invariant from 'tiny-invariant'
import {
  BeltType,
  IAppContext,
  PartialBelt,
} from '../types.js'
import {
  BELT_COLOR,
  BELT_LINE_COLOR,
  Color,
  INTERSECTION_BELT_COLOR,
} from './color.js'
import { batchRenderRect } from './render-rect.js'
import { GpuState } from './types.js'

export function renderBelt(
  _context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  belt: PartialBelt,
  tint?: Color,
) {
  const render = batchRenderRect(gl, gpu)

  if (belt.type === BeltType.enum.Straight) {
    for (const { x, y } of belt.path) {
      render(x, y, 1, 1, BELT_COLOR)
      if (belt.direction === 'x') {
        render(
          x + (belt.offset % 1),
          y,
          0.1,
          1,
          BELT_LINE_COLOR,
        )
      } else {
        invariant(belt.direction === 'y')
        render(
          x,
          y + (belt.offset % 1),
          1,
          0.1,
          BELT_LINE_COLOR,
        )
      }
      if (tint) {
        render(x, y, 1, 1, tint)
      }
    }
  } else {
    invariant(belt.type === BeltType.enum.Intersection)
    const { x, y } = belt.position
    render(x, y, 1, 1, INTERSECTION_BELT_COLOR)
    if (tint) {
      render(x, y, 1, 1, tint)
    }
  }
}
