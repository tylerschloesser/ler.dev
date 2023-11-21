import invariant from 'tiny-invariant'
import { DRAW_GEAR_BOX, TWO_PI, TEETH } from '../const.js'
import { AppState, Gear } from '../types.js'

export function renderGear(
  context: CanvasRenderingContext2D,
  state: AppState,
  gear: Pick<Gear, 'radius' | 'position' | 'angle'>,
  tint?: string,
): void {
  invariant(context)
  const { tileSize } = state

  context.save()
  context.translate(
    (gear.position.x - gear.radius) * tileSize,
    (gear.position.y - gear.radius) * tileSize,
  )

  if (DRAW_GEAR_BOX) {
    context.fillStyle = 'grey'
    context.fillRect(
      0,
      0,
      tileSize * gear.radius * 2,
      tileSize * gear.radius * 2,
    )
  }

  //
  // background
  //

  context.fillStyle = 'blue'
  context.beginPath()
  context.arc(
    gear.radius * tileSize,
    gear.radius * tileSize,
    gear.radius * tileSize,
    0,
    TWO_PI,
  )
  context.fill()
  context.closePath()

  //
  // teeth
  //

  context.save()
  context.translate(
    gear.radius * tileSize,
    gear.radius * tileSize,
  )
  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'white'

  const teeth = gear.radius * TEETH
  for (let i = 0; i < teeth; i++) {
    context.save()
    context.rotate(gear.angle + (i / teeth) * TWO_PI)
    context.moveTo((gear.radius - 0.25) * tileSize, 0)
    context.lineTo(gear.radius * tileSize, 0)
    context.stroke()
    context.restore()
  }
  context.closePath()
  context.restore()

  if (tint) {
    context.fillStyle = tint
    context.fillRect(
      0,
      0,
      tileSize * gear.radius * 2,
      tileSize * gear.radius * 2,
    )
  }

  context.restore()
}
