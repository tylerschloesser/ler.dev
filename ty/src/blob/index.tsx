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
  display: flex;
`

const Label = styled.label`
  display: flex;
  align-items: center;
`

interface BlobProps {
  config: Config
}

export function Blob({ config }: BlobProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const configRef = useRef(config)
  useEffect(() => {
    Object.assign(configRef.current, config)
  }, [config])
  useEffect(() => {
    canvas && init(canvas, configRef.current)
  }, [canvas])
  return <Canvas ref={setCanvas} />
}

export function Demo() {
  const [config, setConfig] = useState<Config>({
    parts: 600,
    xScale: 1,
    yScale: 1,
    zScale: 0.0005,
  })

  const sliders = [
    {
      name: 'parts',
      min: 3,
      max: 1000,
      step: 1,
      value: config.parts,
      toConfig: (value: number) => ({ parts: value }),
    },
    {
      name: 'xy scale',
      min: 0.1,
      max: 10,
      step: 0.05,
      value: config.xScale,
      toConfig: (value: number) => ({ xScale: value, yScale: value }),
    },
    {
      name: 'z scale',
      min: 0,
      max: 0.002,
      step: 0.00005,
      value: config.zScale,
      toConfig: (value: number) => ({ zScale: value }),
    },
  ]

  return (
    <>
      <Controls>
        {sliders.map(({ name, min, max, step, value, toConfig }) => (
          <Label key={name}>
            {name}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) =>
                setConfig(toConfig(parseFloat(e.target.value)) as Config)
              }
            />
          </Label>
        ))}
      </Controls>
      <Blob config={config} />
    </>
  )
}
