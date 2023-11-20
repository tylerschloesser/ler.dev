import { Color } from './color.js'
import { AccelerateHand, AppState } from './types.js'

export function renderAccelerate(
  context: CanvasRenderingContext2D,
  state: AppState,
  accelerate: AccelerateHand,
): void {
  const { tileSize } = state
  if (!accelerate.gear) {
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
