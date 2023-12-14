import invariant from 'tiny-invariant'
import {
  BeltEntity,
  EntityType,
  IAppContext,
  BeltIntersectionEntity,
  ItemType,
  BeltDirection,
} from '../types.js'
import {
  BELT_COLOR,
  BELT_LINE_COLOR,
  Color,
  FUEL_COLOR,
  INTERSECTION_BELT_COLOR,
} from './color.js'
import { batchRenderRect } from './render-rect.js'
import { GpuState } from './types.js'

type RenderFn = ReturnType<typeof batchRenderRect>

function renderLineX(
  render: RenderFn,
  lineWidth: number,
  x: number,
  y: number,
  offset: number,
): void {
  if (offset + lineWidth < 0 || offset > 1) {
    return
  }
  render(
    x + Math.max(offset, 0),
    y,
    lineWidth +
      Math.min(offset, 0) +
      Math.min(1 - (offset + lineWidth), 0),
    1,
    BELT_LINE_COLOR,
  )
}

function renderLineY(
  render: RenderFn,
  lineWidth: number,
  x: number,
  y: number,
  offset: number,
): void {
  if (offset + lineWidth < 0 || offset > 1) {
    return
  }
  render(
    x,
    y + Math.max(offset, 0),
    1,
    lineWidth +
      Math.min(offset, 0) +
      Math.min(1 - (offset + lineWidth), 0),
    BELT_LINE_COLOR,
  )
}

function renderBeltItem(
  render: RenderFn,
  direction: BeltDirection,
  x: number,
  y: number,
  itemType: ItemType,
  position: number,
): void {
  const padding = 0.2

  invariant(itemType === ItemType.enum.Fuel)

  render(
    x + padding,
    y + padding,
    1 - padding * 2,
    1 - padding * 2,
    FUEL_COLOR,
  )
}

export function renderBelt(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  belt: BeltEntity | BeltIntersectionEntity,
  tint?: Color,
) {
  const render = batchRenderRect(gl, gpu)

  const lineWidth = 0.1 + (1 - context.camera.zoom) * 0.1

  if (belt.type === EntityType.enum.Belt) {
    invariant(belt.offset >= 0)
    invariant(belt.offset < 1)
    const { x, y } = belt.position
    render(x, y, 1, 1, BELT_COLOR)
    if (belt.direction === 'x') {
      renderLineX(render, lineWidth, x, y, belt.offset)
      renderLineX(render, lineWidth, x, y, -1 + belt.offset)
    } else {
      invariant(belt.direction === 'y')
      renderLineY(render, lineWidth, x, y, belt.offset)
      renderLineY(render, lineWidth, x, y, -1 + belt.offset)
    }

    for (const item of belt.items) {
      renderBeltItem(
        render,
        belt.direction,
        x,
        y,
        item.type,
        item.position,
      )
    }

    if (tint) {
      render(x, y, 1, 1, tint)
    }
  } else {
    invariant(
      belt.type === EntityType.enum.BeltIntersection,
    )
    const { x, y } = belt.position
    render(x, y, 1, 1, INTERSECTION_BELT_COLOR)
    if (tint) {
      render(x, y, 1, 1, tint)
    }

    invariant(belt.items.length === 0)
  }
}
