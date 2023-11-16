import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { renderChain } from './render-chain.js'
import { ConnectionType, PartialGear } from './types.js'

export function renderConnection({
  gear1,
  gear2,
  type,
  context,
  valid,
  debug,
}: {
  gear1: PartialGear
  gear2: PartialGear
  type: ConnectionType
  context: CanvasRenderingContext2D
  valid: boolean
  debug: boolean
}): void {
  if (debug) {
    switch (type) {
      case ConnectionType.enum.Chain:
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

  if (type === ConnectionType.enum.Chain && valid) {
    renderChain({ gear1, gear2, context })
  }
}
