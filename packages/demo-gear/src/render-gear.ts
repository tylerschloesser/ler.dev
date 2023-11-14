import invariant from 'tiny-invariant'
import { DRAW_GEAR_BOX, TILE_SIZE } from './const.js'
import { ConnectionType, Gear, World } from './types.js'

export function renderGear({
  gear,
  tint,
  context,
  world,
}: {
  gear: Pick<
    Gear,
    'radius' | 'position' | 'angle' | 'connections'
  >
  tint?: string
  context: CanvasRenderingContext2D
  world: World // TODO refactor
}): void {
  invariant(context)

  context.save()
  context.translate(
    (gear.position.x - (gear.radius - 0.5)) * TILE_SIZE,
    (gear.position.y - (gear.radius - 0.5)) * TILE_SIZE,
  )

  if (DRAW_GEAR_BOX) {
    context.fillStyle = 'grey'
    context.fillRect(
      0,
      0,
      TILE_SIZE * gear.radius * 2,
      TILE_SIZE * gear.radius * 2,
    )
  }

  context.strokeStyle = 'white'
  context.fillStyle = 'blue'
  context.beginPath()
  context.arc(
    gear.radius * TILE_SIZE,
    gear.radius * TILE_SIZE,
    gear.radius * TILE_SIZE,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.closePath()

  context.save()
  context.translate(
    gear.radius * TILE_SIZE,
    gear.radius * TILE_SIZE,
  )
  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'white'
  const teeth = gear.radius * 10
  for (let i = 0; i < teeth; i++) {
    context.save()
    context.rotate(gear.angle + (i / teeth) * Math.PI * 2)
    context.moveTo((gear.radius - 0.25) * TILE_SIZE, 0)
    context.lineTo(gear.radius * TILE_SIZE, 0)
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
      TILE_SIZE * gear.radius * 2,
      TILE_SIZE * gear.radius * 2,
    )
  }

  context.restore()

  for (const connection of gear.connections) {
    const peer = world.gears[connection.gearId]
    invariant(peer)

    if (connection.type === ConnectionType.Chain) {
      context.beginPath()
      context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
      context.lineWidth = 2
      context.strokeRect(
        Math.min(peer.position.x, gear.position.x) *
          TILE_SIZE,
        Math.min(peer.position.y, gear.position.y) *
          TILE_SIZE,
        (Math.abs(peer.position.x - gear.position.x) + 1) *
          TILE_SIZE,
        (Math.abs(peer.position.y - gear.position.y) + 1) *
          TILE_SIZE,
      )
      context.closePath()
    } else {
      context.beginPath()
      context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
      context.lineWidth = 2
      context.moveTo(
        (gear.position.x + 0.5) * TILE_SIZE,
        (gear.position.y + 0.5) * TILE_SIZE,
      )
      context.lineTo(
        (peer.position.x + 0.5) * TILE_SIZE,
        (peer.position.y + 0.5) * TILE_SIZE,
      )
      context.stroke()
      context.closePath()
    }
  }
}
