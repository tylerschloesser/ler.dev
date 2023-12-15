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
    Math.max(offset, 0),
    0,
    lineWidth +
      Math.min(offset, 0) +
      Math.min(1 - (offset + lineWidth), 0),
    1,
    BELT_LINE_COLOR,
    0,
    rotation,
    x,
    y,
    1,
    1,
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
    padding + (position - 0.5),
    padding + 0,
    1 - padding * 2,
    1 - padding * 2,
    FUEL_COLOR,
    0.1,
    rotation,
    x,
    y,
    1,
    1,
  )

  // top border
  render(
    padding + (position - 0.5),
    padding + 0,
    1 - padding * 2,
    border,
    ITEM_BORDER,
    0.1,
    rotation,
    x,
    y,
    1,
    1,
  )

  // bottom border
  render(
    padding + (position - 0.5),
    1 - padding + 0 - border,
    1 - padding * 2,
    border,
    ITEM_BORDER,
    0.1,
    rotation,
    x,
    y,
    1,
    1,
  )

  // left border
  render(
    padding + (position - 0.5),
    padding + 0,
    border,
    1 - padding * 2,
    ITEM_BORDER,
    0.1,
    rotation,
    x,
    y,
    1,
    1,
  )

  // right border
  render(
    1 - padding + (position - 0.5) - border,
    padding + 0,
    border,
    1 - padding * 2,
    ITEM_BORDER,
    0.1,
    rotation,
    x,
    y,
    1,
    1,
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
