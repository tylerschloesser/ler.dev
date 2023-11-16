import invariant from 'tiny-invariant'
import { Color } from './color.js'
import {
  HALF_PI,
  PI,
  TEETH,
  TILE_SIZE,
  TWO_PI,
} from './const.js'
import { ConnectionType, Gear } from './types.js'
import { Vec2 } from './vec2.js'

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle'
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

    invariant(gear1.angle === gear2.angle)

    const { radius, angle } = gear1

    const g1 = new Vec2(gear1.position.x, gear1.position.y)
    const g2 = new Vec2(gear2.position.x, gear2.position.y)
    const t = radius * TEETH

    // gear segment size aka. size of a single tooth
    const s1 = (TWO_PI * radius) / t

    // vector from center of gear 1 to gear 2
    const c1 = g2.sub(g1)

    // distance from gear 1 to gear 2
    const d = c1.len()

    // number of segments across distance d
    // must be divisible by 2
    const n = Math.floor(d / (2 * s1)) * 2

    // "gap" size in chain, because d will not be
    // a perfect multiple of s1
    const s2 = (2 * d) / n - s1

    invariant(s2 >= s1)

    // c1 with length radius
    const c2 = c1.norm().mul(radius)

    const A = g1.add(c2.rotate(-HALF_PI))
    const B = g2.add(c2.rotate(-HALF_PI))

    const C = g2.add(c2.rotate(HALF_PI))
    const D = g1.add(c2.rotate(HALF_PI))

    //
    // Render straight portions of chain
    //

    context.setLineDash([s1 * TILE_SIZE, s2 * TILE_SIZE])
    context.lineDashOffset =
      // because offset is "backwards"
      -1 *
      radius *
      TILE_SIZE *
      // how much progress have we made through 2 segments
      ((angle % (s1 + s1)) / (s1 + s1)) *
      // scale to the potentially larger chain segment size
      (s1 + s2)

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

    //
    // Render curved portions of chain
    //

    context.setLineDash([s1 * TILE_SIZE])
    context.lineDashOffset =
      -1 * radius * TILE_SIZE * (angle % (s1 + s1))

    context.beginPath()
    context.arc(
      g1.x * TILE_SIZE,
      g1.y * TILE_SIZE,
      radius * TILE_SIZE,
      c1.angle() + HALF_PI,
      c1.angle() + HALF_PI + PI,
    )
    context.stroke()
    context.closePath()

    context.beginPath()
    context.arc(
      g2.x * TILE_SIZE,
      g2.y * TILE_SIZE,
      radius * TILE_SIZE,
      c1.angle() + -HALF_PI,
      c1.angle() + -HALF_PI + PI,
    )
    context.stroke()
    context.closePath()

    context.setLineDash([])
  }
}
