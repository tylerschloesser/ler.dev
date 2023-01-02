import { curry } from 'lodash/fp'
import React, { useEffect, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'
import styled from 'styled-components'
import { Config, RenderMethod } from './config'

const noise = createNoise3D()

type RenderFn = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  config: Config,
  timestamp: number,
) => void

const renderSimple: RenderFn = (canvas, context, config, timestamp) => {
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

  window.requestAnimationFrame(curry(render)(canvas, context, config))
}

const render: RenderFn = (canvas, context, config, timestamp) => {
  const { renderMethod = RenderMethod.Simple } = config
  const renderFn = {
    [RenderMethod.Simple]: renderSimple,
    [RenderMethod.Bezier]: renderSimple,
  }[renderMethod]
  renderFn(canvas, context, config, timestamp)
}

function init(canvas: HTMLCanvasElement, config: Config) {
  {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }
  const context = canvas.getContext('2d')!
  window.requestAnimationFrame(curry(render)(canvas, context, config))
}

const Canvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`

export interface BlobProps {
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
