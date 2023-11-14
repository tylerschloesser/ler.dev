import { createNoise3D } from 'simplex-noise'
import { RenderFn } from './config.js'

const noise = createNoise3D()

export const renderSimple: RenderFn = (canvas, context, config, timestamp) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'hsl(0, 0%, 80%)'

  const translate = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  }

  context.beginPath()
  context.moveTo(translate.x + 0, translate.y + 0)

  const { parts, xScale, yScale, zScale } = config
  for (let i = 0; i <= parts; i++) {
    const theta = ((Math.PI * 2) / parts) * i

    let x = Math.sin(theta)
    let y = Math.cos(theta)

    let radius = Math.min(canvas.width, canvas.height) * 0.15
    radius +=
      ((noise(x * xScale, y * yScale, timestamp * zScale) + 1) / 2) *
      (radius / 1)

    x *= radius
    y *= radius

    context.lineTo(translate.x + x, translate.y + y)
  }
  context.fill()
  context.closePath()
}
