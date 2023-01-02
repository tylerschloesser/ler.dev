import { createNoise3D } from 'simplex-noise'
import { Vec2 } from '../common/vec2'
import { RenderFn } from './config'

const noise = createNoise3D()

export const renderBezier: RenderFn = (canvas, context, config, timestamp) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'hsl(0, 0%, 80%)'

  const translate = new Vec2(canvas.width / 2, canvas.height / 2)

  context.beginPath()
  context.moveTo(translate.x + 0, translate.y + 0)

  let previous = new Vec2(translate.x + 0, translate.y + 0)

  const { parts, xScale, yScale, zScale } = config

  for (let i = 0; i <= parts; i++) {
    const theta = ((Math.PI * 2) / parts) * i

    let p = new Vec2(Math.sin(theta), Math.cos(theta))

    let radius = Math.min(canvas.width, canvas.height) * 0.15
    radius +=
      ((noise(p.x * xScale, p.y * yScale, timestamp * zScale) + 1) / 2) *
      (radius / 1)

    p = p.mul(radius)

    context.bezierCurveTo(previous.x, previous.y, p.x, p.y, p.x, p.y)
  }
  context.fill()
  context.closePath()
}
