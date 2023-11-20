import { Color } from './color.js'
import { renderChain } from './render-chain.js'
import {
  AppState,
  ConnectionType,
  PartialGear,
} from './types.js'

export function renderConnection(
  context: CanvasRenderingContext2D,
  state: AppState,
  type: ConnectionType,
  gear1: PartialGear,
  gear2: PartialGear,
  valid: boolean,
  debug: boolean,
): void {
  const { tileSize } = state
  if (debug) {
    switch (type) {
      case ConnectionType.enum.Chain:
      case ConnectionType.enum.Adjacent: {
        context.beginPath()
        context.strokeStyle = Color.Connection
        context.lineWidth = 2
        context.moveTo(
          gear1.position.x * tileSize,
          gear1.position.y * tileSize,
        )
        context.lineTo(
          gear2.position.x * tileSize,
          gear2.position.y * tileSize,
        )
        context.stroke()
        context.closePath()
        break
      }
    }
  }

  if (type === ConnectionType.enum.Chain && valid) {
    renderChain(context, state, gear1, gear2)
  }
}
