import invariant from 'tiny-invariant'
import { HALF_PI, PI, TEETH, TWO_PI } from '../const.js'
import { AppState, PartialGear } from '../types.js'
import { Vec2 } from '../vec2.js'

type ChainId = string

interface RenderVars {
  s1: number
  s2: number
  radius: number
  A: Vec2
  B: Vec2
  C: Vec2
  D: Vec2
  g1: Vec2
  g2: Vec2
  c1: Vec2
}

//
// cache render vars because for now they're static
//

const cache = new Map<ChainId, RenderVars>()

export function renderChain(
  context: CanvasRenderingContext2D,
  state: AppState,
  gear1: PartialGear,
  gear2: PartialGear,
): void {
  const { tileSize } = state
  const { s1, s2, radius, A, B, C, D, g1, g2, c1 } =
    getRenderVars(gear1, gear2)

  invariant(gear1.angle === gear2.angle)
  const { angle } = gear1

  //
  // Render straight portions of chain
  //

  // TODO cache the array?
  context.setLineDash([s1 * tileSize, s2 * tileSize])
  context.lineDashOffset =
    // because offset is "backwards"
    -1 *
    radius *
    tileSize *
    // how much progress have we made through 2 segments
    ((angle % (s1 + s1)) / (s1 + s1)) *
    // scale to the potentially larger chain segment size
    (s1 + s2)

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'white'
  context.moveTo(A.x * tileSize, A.y * tileSize)
  context.lineTo(B.x * tileSize, B.y * tileSize)
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'white'
  context.moveTo(C.x * tileSize, C.y * tileSize)
  context.lineTo(D.x * tileSize, D.y * tileSize)
  context.stroke()
  context.closePath()

  //
  // Render curved portions of chain
  //

  context.setLineDash([s1 * tileSize])
  context.lineDashOffset =
    -1 * radius * tileSize * (angle % (s1 + s1))

  context.beginPath()
  context.arc(
    g1.x * tileSize,
    g1.y * tileSize,
    radius * tileSize,
    c1.angle() + HALF_PI,
    c1.angle() + HALF_PI + PI,
  )
  context.stroke()
  context.closePath()

  context.beginPath()
  context.arc(
    g2.x * tileSize,
    g2.y * tileSize,
    radius * tileSize,
    c1.angle() + -HALF_PI,
    c1.angle() + -HALF_PI + PI,
  )
  context.stroke()
  context.closePath()

  context.setLineDash([])
}

function getRenderVars(
  gear1: PartialGear,
  gear2: PartialGear,
): RenderVars {
  const chainId = getChainId(gear1, gear2)
  const cached = cache.get(chainId)
  if (cached) {
    return cached
  }

  invariant(gear1.radius === gear2.radius)
  invariant(gear1.radius === 1)
  const { radius } = gear1

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

  const vars: RenderVars = {
    s1,
    s2,
    radius,
    A,
    B,
    C,
    D,
    g1,
    g2,
    c1,
  }

  cache.set(chainId, vars)

  return vars
}

function getChainId(
  gear1: PartialGear,
  gear2: PartialGear,
): ChainId {
  // this assumes we'll always render with gears in the same order...
  return [
    'gear1',
    `${gear1.position.x}`,
    `${gear1.position.y}`,
    'gear2',
    `${gear2.position.x}`,
    `${gear2.position.y}`,
  ].join('.')
}
