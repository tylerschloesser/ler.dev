import { curry } from 'lodash/fp'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Config, RenderFn, RenderMethod } from './config'
import { renderBezier } from './render-bezier'
import { renderSimple } from './render-simple'

const render: RenderFn = (canvas, context, config, timestamp) => {
  const { renderMethod = RenderMethod.Simple } = config
  const renderFn = {
    [RenderMethod.Simple]: renderSimple,
    [RenderMethod.Bezier]: renderBezier,
  }[renderMethod]
  renderFn(canvas, context, config, timestamp)
  window.requestAnimationFrame(curry(render)(canvas, context, config))
}

function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

function init(canvas: HTMLCanvasElement, config: Config): { cleanup(): void } {
  resize(canvas)
  const ro = new ResizeObserver(() => {
    resize(canvas)
  })
  ro.observe(canvas)
  const context = canvas.getContext('2d')!
  window.requestAnimationFrame(curry(render)(canvas, context, config))

  return {
    cleanup: () => {
      ro.disconnect()
    },
  }
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
    if (canvas) {
      return init(canvas, configRef.current).cleanup
    }
  }, [canvas])
  return <Canvas ref={setCanvas} />
}
