import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { ConnectionType, Gear } from './types.js'

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle' | 'velocity'
>

export function renderConnection({
  gear1,
  gear2,
  type,
  context,
}: {
  gear1: PartialGear
  gear2: PartialGear
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

      context.strokeStyle = 'white'
      context.lineWidth = 2

      invariant(
        gear1.radius === gear2.radius && gear1.radius === 1,
      )
      invariant(gear1.velocity === gear2.velocity)

      const teeth = gear1.radius * 10
      const len =
        ((2 * Math.PI * gear1.radius) / teeth) * TILE_SIZE

      context.setLineDash([len])

      {
        context.beginPath()
        context.lineDashOffset =
          gear1.angle *
          gear1.radius *
          TILE_SIZE *
          Math.sign(gear1.velocity)

        context.moveTo(
          (gear1.position.x + gear1.radius * dy) *
            TILE_SIZE,
          (gear1.position.y + gear1.radius * dx) *
            TILE_SIZE,
        )

        context.lineTo(
          (gear2.position.x + gear2.radius * dy) *
            TILE_SIZE,
          (gear2.position.y + gear2.radius * dx) *
            TILE_SIZE,
        )

        context.stroke()
        context.closePath()

        context.lineDashOffset *= -1

        context.beginPath()
        context.moveTo(
          (gear1.position.x + gear1.radius * -dy) *
            TILE_SIZE,
          (gear1.position.y + gear1.radius * -dx) *
            TILE_SIZE,
        )

        context.lineTo(
          (gear2.position.x + gear2.radius * -dy) *
            TILE_SIZE,
          (gear2.position.y + gear2.radius * -dx) *
            TILE_SIZE,
        )
        context.stroke()
        context.closePath()
      }

      context.setLineDash([])

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
