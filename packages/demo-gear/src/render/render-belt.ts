import invariant from 'tiny-invariant'
import {
  Belt,
  BeltDirection,
  BeltItem,
  BeltTurn,
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
  TRANSPARENT,
  rgba,
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

const TURN_ROTATION_MAP: Record<
  typeof BeltTurn.enum.Left | typeof BeltTurn.enum.Right,
  Record<Rotation, Rotation>
> = {
  [BeltTurn.enum.Left]: {
    0: 270,
    90: 0,
    180: 90,
    270: 180,
  },
  [BeltTurn.enum.Right]: {
    0: 90,
    90: 180,
    180: 270,
    270: 0,
  },
}

function getTurnRotation(belt: Belt): Rotation {
  invariant(belt.turn !== BeltTurn.enum.None)
  return TURN_ROTATION_MAP[belt.turn][belt.rotation]
}

function renderBeltItem(
  render: RenderFn,
  belt: Belt,
  item: BeltItem,
): void {
  const border = 0.1
  const size = 0.8

  invariant(item.type === ItemType.enum.Fuel)

  let { rotation } = belt
  if (
    belt.turn !== BeltTurn.enum.None &&
    item.position > 0.5
  ) {
    rotation = getTurnRotation(belt)
  }

  const x = item.position - size / 2
  const y = 0.5 - size / 2

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

  let rotation: Rotation =
    belt.direction === BeltDirection.enum.NorthSouth
      ? 90
      : 0

  if (belt.direction !== BeltDirection.enum.NorthSouth) {
    renderLine(
      render,
      lineWidth,
      x,
      y,
      belt.offset,
      0,
      BELT_LINE_COLOR,
    )
    renderLine(
      render,
      lineWidth,
      x,
      y,
      -1 + belt.offset,
      0,
      BELT_LINE_COLOR,
    )
  }
  if (belt.direction !== BeltDirection.enum.EastWest) {
    renderLine(
      render,
      lineWidth,
      x,
      y,
      belt.offset,
      90,
      BELT_LINE_COLOR,
    )
    renderLine(
      render,
      lineWidth,
      x,
      y,
      -1 + belt.offset,
      90,
      BELT_LINE_COLOR,
    )
  }

  for (const item of belt.items) {
    renderBeltItem(render, belt, item)
  }

  if (tint) {
    render(x, y, 1, 1, tint)
  }
}
