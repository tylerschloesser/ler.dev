import invariant from 'tiny-invariant'
import {
  Belt,
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

function getTurnRotation(belt: Belt): Rotation {
  switch (belt.turn) {
    case BeltTurn.enum.Left: {
      switch (belt.rotation) {
        case 0:
          return 270
        case 90:
          return 0
        case 180:
          return 90
        case 270:
          return 180
      }
    }
    case BeltTurn.enum.Right: {
      switch (belt.rotation) {
        case 0:
          return 90
        case 90:
          return 180
        case 180:
          return 270
        case 270:
          return 0
      }
    }
    default:
      invariant(false)
  }
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

  if (belt.turn !== BeltTurn.enum.None) {
    const turnRotation = getTurnRotation(belt)
    renderLine(
      render,
      lineWidth,
      x,
      y,
      belt.offset,
      turnRotation,
    )
    renderLine(
      render,
      lineWidth,
      x,
      y,
      -1 + belt.offset,
      turnRotation,
    )
  }

  for (const item of belt.items) {
    renderBeltItem(render, belt, item)
  }

  if (tint) {
    render(x, y, 1, 1, tint)
  }
}
