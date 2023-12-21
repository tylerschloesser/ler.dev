import invariant from 'tiny-invariant'
import {
  Belt,
  BeltDirection,
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
  TURN_BELT_LINE_COLOR,
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
  color: Color = BELT_LINE_COLOR,
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
    color,
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
  invert: boolean,
): void {
  const border = 0.1
  const size = 0.8

  invariant(item.type === ItemType.enum.Fuel)

  let rotation: Rotation = 0
  if (belt.direction === BeltDirection.enum.NorthSouth) {
    rotation = 90
  }

  let x = item.position - size / 2
  const y = 0.5 - size / 2

  if (invert) {
    x = 1 - x
  }

  render(
    x,
    y,
    size,
    size,
    FUEL_COLOR,
    0.1,
    rotation,
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
    rotation,
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
    rotation,
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
    rotation,
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
    rotation,
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

  const { x, y } = belt.position

  render(x, y, 1, 1, BELT_COLOR)

  const lineColor =
    belt.direction === BeltDirection.enum.NorthSouth ||
    belt.direction === BeltDirection.enum.EastWest
      ? BELT_LINE_COLOR
      : TURN_BELT_LINE_COLOR

  if (belt.direction !== BeltDirection.enum.NorthSouth) {
    renderLine(
      render,
      lineWidth,
      x,
      y,
      belt.offset,
      0,
      lineColor,
    )
    renderLine(
      render,
      lineWidth,
      x,
      y,
      -1 + belt.offset,
      0,
      lineColor,
    )
  }
  if (belt.direction !== BeltDirection.enum.EastWest) {
    let offset = belt.offset

    if (
      belt.direction === BeltDirection.enum.NorthWest ||
      belt.direction === BeltDirection.enum.SouthEast
    ) {
      offset = 1 - offset
    }

    renderLine(
      render,
      lineWidth,
      x,
      y,
      offset,
      90,
      lineColor,
    )
    renderLine(
      render,
      lineWidth,
      x,
      y,
      -1 + offset,
      90,
      lineColor,
    )
  }

  const path = context.world.paths[belt.pathId]
  invariant(path)
  const config = path.config[belt.id]
  invariant(config)

  for (const item of belt.items) {
    renderBeltItem(render, belt, item, config.invert)
  }

  if (tint) {
    render(x, y, 1, 1, tint)
  }
}
