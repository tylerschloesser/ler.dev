import { curry } from 'lodash/fp'
import React, { useEffect, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'
import styled from 'styled-components'

const noise = createNoise3D()

interface Config {
  parts: number
  xScale: number
  yScale: number
  zScale: number
}

const render = curry(
  (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    config: Config,
    timestamp: number,
  ) => {
    context.clearRect(0, 0, canvas.width, canvas.height)

    {
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

    window.requestAnimationFrame(render(canvas, context, config))
  },
)

function init(canvas: HTMLCanvasElement, config: Config) {
  {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }
  const context = canvas.getContext('2d')!
  window.requestAnimationFrame(render(canvas, context, config))
}

const Canvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`

const Controls = styled.div`
  position: fixed;
`

export function Blob() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const [config, setConfig] = useState<Config>({
    parts: 600,
    xScale: 10.9,
    yScale: 10.9,
    zScale: 0.00025,
  })
  const configRef = useRef(config)

  useEffect(() => {
    Object.assign(configRef.current, config)
  }, [config])

  useEffect(() => {
    canvas && init(canvas, configRef.current)
  }, [canvas])

  return (
    <>
      <Controls>
        <label>
          parts:
          <input
            type="range"
            min={2}
            max={1000}
            value={config.parts}
            onChange={(e) =>
              setConfig({
                parts: parseInt(e.target.value),
              } as Config)
            }
          />
        </label>
      </Controls>
      <Canvas ref={setCanvas} />
    </>
  )
}
