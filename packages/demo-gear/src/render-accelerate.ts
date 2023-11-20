import { Color } from './color.js'
import { AppState } from './types.js'

export function renderAccelerate(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { accelerate, tileSize } = state
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
    (gear.position.x - gear.radius) * tileSize,
    (gear.position.y - gear.radius) * tileSize,
    tileSize * gear.radius * 2,
    tileSize * gear.radius * 2,
  )
  context.closePath()
}
