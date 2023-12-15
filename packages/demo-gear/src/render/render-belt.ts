import invariant from 'tiny-invariant'
import {
  Belt,
  IAppContext,
  ItemType,
  Rotation,
} from '../types.js'
import {
  BELT_COLOR,
  BELT_LINE_COLOR,
  Color,
  FUEL_COLOR,
  ITEM_BORDER,
} from './color.js'
import { batchRenderRect } from './render-rect.js'
import { GpuState } from './types.js'

type RenderFn = ReturnType<typeof batchRenderRect>

function renderLine(
  render: RenderFn,
  lineWidth: number,
  x: number,
  y: number,
  offset: number,
  rotation: Rotation,
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
    0,
    rotation,
  )
}

function renderBeltItem(
  render: RenderFn,
  rotation: Rotation,
  x: number,
  y: number,
  itemType: ItemType,
  position: number,
): void {
  const border = 0.1
  const padding = 0.2

  invariant(itemType === ItemType.enum.Fuel)

  render(
    x + padding + (position - 0.5),
    y + padding + 0,
    1 - padding * 2,
    1 - padding * 2,
    FUEL_COLOR,
    0.1,
    rotation,
  )

  // top border
  render(
    x + padding + (position - 0.5),
    y + padding + 0,
    1 - padding * 2,
    border,
    ITEM_BORDER,
    0.1,
    rotation,
  )

  // bottom border
  render(
    x + padding + (position - 0.5),
    y + 1 - padding + 0 - border,
    1 - padding * 2,
    border,
    ITEM_BORDER,
    0.1,
    rotation,
  )

  // left border
  render(
    x + padding + (position - 0.5),
    y + padding + 0,
    border,
    1 - padding * 2,
    ITEM_BORDER,
    0.1,
    rotation,
  )

  // right border
  render(
    x + 1 - padding + (position - 0.5) - border,
    y + padding + 0,
    border,
    1 - padding * 2,
    ITEM_BORDER,
    0.1,
    rotation,
  )
}

export function renderBelt(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  belt: Belt,
  tint?: Color,
) {
  const render = batchRenderRect(gl, gpu)

  const lineWidth = 0.1 + (1 - context.camera.zoom) * 0.1

  invariant(belt.offset >= 0)
  invariant(belt.offset < 1)

  const { rotation } = belt
  const { x, y } = belt.position
  render(x, y, 1, 1, BELT_COLOR)
  renderLine(render, lineWidth, x, y, belt.offset, rotation)
  renderLine(
    render,
    lineWidth,
    x,
    y,
    -1 + belt.offset,
    rotation,
  )

  for (const item of belt.items) {
    renderBeltItem(
      render,
      belt.rotation,
      x,
      y,
      item.type,
      item.position,
    )
  }

  if (tint) {
    render(x, y, 1, 1, tint)
  }
}
