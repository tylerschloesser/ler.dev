import { curry } from 'lodash/fp'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Config, RenderFn, RenderMethod } from './config'
import { renderSimple } from './render-simple'

const render: RenderFn = (canvas, context, config, timestamp) => {
  const { renderMethod = RenderMethod.Simple } = config
  const renderFn = {
    [RenderMethod.Simple]: renderSimple,
    [RenderMethod.Bezier]: renderSimple,
  }[renderMethod]
  renderFn(canvas, context, config, timestamp)
  window.requestAnimationFrame(curry(render)(canvas, context, config))
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
