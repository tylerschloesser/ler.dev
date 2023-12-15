import invariant from 'tiny-invariant'
import {
  Belt,
  BeltItem,
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
  belt: Belt,
  item: BeltItem,
): void {
  const border = 0.1
  const size = 0.8

  invariant(item.type === ItemType.enum.Fuel)

  const x = item.position - size / 2
  const y = 0.5 - size / 2

  render(
    x,
    y,
    size,
    size,
    FUEL_COLOR,
    0.1,
    belt.rotation,
    belt.position.x,
    belt.position.y,
    1,
    1,
  )

  // top border
  render(
    x,
    y,
    size,
    border,
    ITEM_BORDER,
    0.1,
    belt.rotation,
    belt.position.x,
    belt.position.y,
    1,
    1,
  )

  // bottom border
  render(
    x,
    y + size - border,
    size,
    border,
    ITEM_BORDER,
    0.1,
    belt.rotation,
    belt.position.x,
    belt.position.y,
    1,
    1,
  )

  // left border
  render(
    x,
    y,
    border,
    size,
    ITEM_BORDER,
    0.1,
    belt.rotation,
    belt.position.x,
    belt.position.y,
    1,
    1,
  )

  // right border
  render(
    x + size - border,
    y,
    border,
    size,
    ITEM_BORDER,
    0.1,
    belt.rotation,
    belt.position.x,
    belt.position.y,
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
    renderBeltItem(render, belt, item)
  }

  if (tint) {
    render(x, y, 1, 1, tint)
  }
}
