import { times } from 'lodash'
import { createNoise3D } from 'simplex-noise'
import { Vec2 } from '../common/vec2'
import { RenderFn } from './config'

const noise = createNoise3D()

export const renderBezier: RenderFn = (canvas, context, config, timestamp) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'hsl(0, 0%, 80%)'

  const translate = new Vec2(canvas.width / 2, canvas.height / 2)

  context.beginPath()

  const { parts, xScale, yScale, zScale } = config

  const controlPoints: Vec2[] = []

  const points: Vec2[] = times(parts, (i) => {
    const theta = ((Math.PI * 2) / parts) * i
    let p = new Vec2(Math.sin(theta), Math.cos(theta))

    let radius = Math.min(canvas.width, canvas.height) * 0.15
    radius +=
      ((noise(p.x * xScale, p.y * yScale, timestamp * zScale) + 1) / 2) *
      (radius / 1)

    p = p.mul(radius)
    p = translate.add(p)

    return p
  })

  context.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length + 1; i++) {
    const prev = points[(i - 1) % parts]
    const p = points[i % parts]
    const cp1 = (() => {
      const a = points[i % parts]
      const b = points[(i - 2 + parts) % parts]
      return prev.sub(b.sub(a).div(4))
    })()
    const cp2 = (() => {
      const a = points[(i - 1) % parts]
      const b = points[(i + 1) % parts]
      return p.sub(b.sub(a).div(4))
    })()
    context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y)

    controlPoints.push(cp1, cp2)
  }
  context.fill()
  context.closePath()

  context.fillStyle = 'red'
  controlPoints.forEach((cp) => {
    context.beginPath()
    context.arc(cp.x, cp.y, 5, 0, 2 * Math.PI)
    context.fill()
  })

  context.fillStyle = 'blue'
  points.forEach((p) => {
    context.beginPath()
    context.arc(p.x, p.y, 5, 0, 2 * Math.PI)
    context.fill()
  })
}
