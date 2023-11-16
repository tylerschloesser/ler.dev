import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { ConnectionType, Gear } from './types.js'
import { Vec2 } from './vec2.js'

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle' | 'velocity'
>

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
    invariant(gear1.radius === gear2.radius)
    invariant(gear1.radius === 1)

    const g1 = new Vec2(gear1.position.x, gear1.position.y)
    const g2 = new Vec2(gear2.position.x, gear2.position.y)
    const t = gear1.radius * 10
    const s1 = (Math.PI * 2 * gear1.radius) / t
    const c1 = g1.sub(g2)
    const d = c1.len()
    const n = Math.floor(d / (2 * s1)) * 2
    const s2 = n * s1

    const c2 = c1.norm().mul(gear1.radius)
    const A = g1.add(new Vec2(-c2.y, -c2.x))
    const B = g2.add(new Vec2(-c2.y, -c2.x))

    const C = g2.add(new Vec2(c2.y, c2.x))
    const D = g1.add(new Vec2(c2.y, c2.x))

    context.beginPath()
    context.lineWidth = 2
    context.strokeStyle = 'white'
    context.moveTo(A.x * TILE_SIZE, A.y * TILE_SIZE)
    context.lineTo(B.x * TILE_SIZE, B.y * TILE_SIZE)
    context.stroke()
    context.closePath()

    context.beginPath()
    context.lineWidth = 2
    context.strokeStyle = 'white'
    context.moveTo(C.x * TILE_SIZE, C.y * TILE_SIZE)
    context.lineTo(D.x * TILE_SIZE, D.y * TILE_SIZE)
    context.stroke()
    context.closePath()
  }
}
