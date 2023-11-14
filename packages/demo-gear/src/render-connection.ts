import invariant from 'tiny-invariant'
import { TILE_SIZE } from './const.js'
import { ConnectionType, Gear } from './types.js'

export function renderConnection({
  gear1,
  gear2,
  type,
  context,
}: {
  gear1: Gear
  gear2: Gear
  type: ConnectionType
  context: CanvasRenderingContext2D
}): void {
  if (type === ConnectionType.Chain) {
    context.beginPath()
    context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
    context.lineWidth = 2
    context.strokeRect(
      Math.min(gear1.position.x, gear2.position.x) *
        TILE_SIZE,
      Math.min(gear1.position.y, gear2.position.y) *
        TILE_SIZE,
      (Math.abs(gear1.position.x - gear2.position.x) + 1) *
        TILE_SIZE,
      (Math.abs(gear1.position.y - gear2.position.y) + 1) *
        TILE_SIZE,
    )
    context.closePath()
  } else {
    invariant(type === ConnectionType.Teeth)

    context.beginPath()
    context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
    context.lineWidth = 2
    context.moveTo(
      (gear1.position.x + 0.5) * TILE_SIZE,
      (gear1.position.y + 0.5) * TILE_SIZE,
    )
    context.lineTo(
      (gear2.position.x + 0.5) * TILE_SIZE,
      (gear2.position.y + 0.5) * TILE_SIZE,
    )
    context.stroke()
    context.closePath()
  }
}
