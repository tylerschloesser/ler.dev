import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { AppState } from './types.js'

export function renderAccelerate(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { accelerate } = state
  if (!accelerate?.position) {
    return
  }
  const { world } = state
  const tileId = `${accelerate.position.x}.${accelerate.position.y}`
  const tile = world.tiles[tileId]
  if (!tile) {
    return
  }

  const gear = world.gears[tile.gearId]
  invariant(gear)

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = accelerate.gear
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
