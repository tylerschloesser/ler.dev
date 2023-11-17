import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import {
  AddGearHover,
  AppState,
  ApplyForceHover,
  Hover,
  HoverType,
  Pointer,
  World,
} from './types.js'

type RenderHoverFn<T extends Hover> = (args: {
  pointer: Pointer
  hover: T
  context: CanvasRenderingContext2D
  world: World
}) => void

const renderAddGearHover: RenderHoverFn<AddGearHover> = ({
  pointer,
  hover,
  context,
  world,
}) => {
  renderGear({
    gear: {
      position: pointer.position,
      radius: hover.radius,
      angle: 0,
    },
    tint: hover.valid
      ? Color.AddGearValid
      : Color.AddGearInvalid,
    context,
  })

  for (const connection of hover.connections) {
    const gear2 = world.gears[connection.gearId]
    invariant(gear2)

    renderConnection({
      context,
      gear1: {
        position: pointer.position,
        radius: hover.radius,
        angle: gear2.angle,
      },
      gear2,
      type: connection.type,
      valid: hover.valid,
      debug: world.debugConnections,
    })
  }
}

const renderApplyForceHover: RenderHoverFn<
  ApplyForceHover
> = ({ pointer, context, world }) => {
  const tileId = `${pointer.position.x}.${pointer.position.y}`
  const tile = world.tiles[tileId]
  if (!tile) {
    return
  }

  const gear = world.gears[tile.gearId]
  invariant(gear)

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = pointer.down
    ? Color.ApplyForceActive
    : Color.ApplyForceInactive
  context.strokeRect(
    (gear.position.x - gear.radius) * TILE_SIZE,
    (gear.position.y - gear.radius) * TILE_SIZE,
    TILE_SIZE * gear.radius * 2,
    TILE_SIZE * gear.radius * 2,
  )
  context.closePath()
}

export function renderHover({
  state,
  context,
}: {
  state: AppState
  context: CanvasRenderingContext2D
}): void {
  const { hover, pointer, world } = state
  if (!hover || !pointer) {
    return
  }
  switch (hover.type) {
    case HoverType.AddGear: {
      renderAddGearHover({ pointer, hover, context, world })
      break
    }
    case HoverType.ApplyForce:
      renderApplyForceHover({
        pointer,
        hover,
        context,
        world,
      })
      break
  }
}
