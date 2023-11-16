import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { ConnectionType, Gear } from './types.js'

export function renderConnection({
  gear1,
  gear2,
  type,
  context,
}: {
  gear1: Pick<Gear, 'position' | 'radius'>
  gear2: Pick<Gear, 'position' | 'radius'>
  type: ConnectionType
  context: CanvasRenderingContext2D
}): void {
  switch (type) {
    case ConnectionType.enum.Chain: {
      const x =
        Math.min(
          gear1.position.x - gear1.radius,
          gear2.position.x - gear2.radius,
        ) * TILE_SIZE
      const y =
        Math.min(
          gear1.position.y - gear1.radius,
          gear2.position.y - gear2.radius,
        ) * TILE_SIZE
      const w =
        Math.max(
          gear1.position.x + gear1.radius,
          gear2.position.x + gear2.radius,
        ) *
          TILE_SIZE -
        x
      const h =
        Math.max(
          gear1.position.y + gear1.radius,
          gear2.position.y + gear2.radius,
        ) *
          TILE_SIZE -
        y

      context.beginPath()
      context.strokeStyle = Color.Connection
      context.lineWidth = 2
      context.strokeRect(x, y, w, h)
      context.closePath()

      const dx = Math.sign(
        gear1.position.x - gear2.position.x,
      )
      const dy = Math.sign(
        gear1.position.y - gear2.position.y,
      )

      invariant(!(dx === 0 && dy === 0))
      invariant(dx === 0 || dy === 0)

      break
    }
    case ConnectionType.enum.Teeth: {
      context.beginPath()
      context.strokeStyle = Color.Connection
      context.lineWidth = 2
      context.moveTo(
        gear1.position.x * TILE_SIZE,
        gear1.position.y * TILE_SIZE,
      )
      context.lineTo(
        gear2.position.x * TILE_SIZE,
        gear2.position.y * TILE_SIZE,
      )
      context.stroke()
      context.closePath()
      break
    }
  }
}
