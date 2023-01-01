import { curry } from 'lodash/fp'
import React, { useEffect, useState } from 'react'
import { createNoise2D } from 'simplex-noise'
import styled from 'styled-components'

const noise = createNoise2D()

const render = curry(
  (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    timestamp: number,
  ) => {
    {
      context.fillStyle = 'hsl(0, 0%, 80%)'

      const translate = {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }

      context.moveTo(translate.x + 0, translate.y + 0)

      const parts = 7
      for (let i = 0; i <= parts; i++) {
        const theta = ((Math.PI * 2) / parts) * i

        let x = Math.sin(theta)
        let y = Math.cos(theta)

        let radius = Math.min(canvas.width, canvas.height) * 0.1
        radius += ((noise(x, y) + 1) / 2) * radius

        x *= radius
        y *= radius

        context.lineTo(translate.x + x, translate.y + y)
      }
      context.fill()
    }

    window.requestAnimationFrame(render(canvas, context))
  },
)

function init(canvas: HTMLCanvasElement) {
  {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }
  const context = canvas.getContext('2d')!
  window.requestAnimationFrame(render(canvas, context))
}

const Canvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`

export function Blob() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    canvas && init(canvas)
  }, [canvas])
  return <Canvas ref={setCanvas} />
}
