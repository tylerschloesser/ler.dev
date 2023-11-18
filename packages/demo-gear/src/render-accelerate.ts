import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { AppState } from './types.js'

export function renderAccelerate(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { accelerate } = state
  if (!accelerate || !accelerate.gear) {
    return
  }
  const { gear } = accelerate

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = accelerate.active
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
