import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { AppState, ApplyForcePointer } from './types.js'

export function renderApplyForcePointer(
  state: AppState,
  pointer: ApplyForcePointer,
  context: CanvasRenderingContext2D,
): void {
  const { world } = state
  const tileId = `${pointer.position.x}.${pointer.position.y}`
  const tile = world.tiles[tileId]
  if (!tile) {
    return
  }

  const gear = world.gears[tile.gearId]
  invariant(gear)

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = pointer.gear
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
