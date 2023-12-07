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
import { batchRenderRectWithMask } from './render-rect.js'
import { GpuState } from './types.js'

export function renderBelt(
  _context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  belt: PartialBelt,
  tint?: Color,
) {
  const { render, renderWithMask } =
    batchRenderRectWithMask(gl, gpu)

  if (belt.type === BeltType.enum.Straight) {
    invariant(belt.offset >= 0)
    invariant(belt.offset < 1)
    for (const { x, y } of belt.path) {
      render(x, y, 1, 1, BELT_COLOR)
      const lineWidth = 0.1
      if (belt.direction === 'x') {
        renderWithMask(
          belt.offset,
          0,
          lineWidth,
          1,
          x,
          y,
          1,
          1,
          BELT_LINE_COLOR,
        )
        renderWithMask(
          -1 + belt.offset,
          0,
          lineWidth,
          1,
          x,
          y,
          1,
          1,
          BELT_LINE_COLOR,
        )
      } else {
        invariant(belt.direction === 'y')
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
