import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export type InitFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}) => void

export type RenderFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  viewport: Viewport
  timestamp: number
  elapsed: number
}) => void

export interface EngineProps {
  init: InitFn
  render: RenderFn
}

export interface Viewport {
  w: number
  h: number
}

function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`

export function Engine({ init, render }: EngineProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const initialized = useRef(false)

  useEffect(() => {
    if (!canvas || initialized.current) {
      return
    }

    initialized.current = true

    resize(canvas)
    const ro = new ResizeObserver(() => {
      resize(canvas)
    })
    ro.observe(canvas)

    const controller = new AbortController()
    const context = canvas.getContext('2d')!

    init({ canvas, context })

    let last: null | number = null
    function wrap(timestamp: number) {
      if (!canvas) {
        console.error('<canvas> no longer available')
        return
      }

      let elapsed = (last ? timestamp - last : 0) / 1000
      last = timestamp
      const viewport: Viewport = {
        w: canvas.width,
        h: canvas.height,
      }
      render({
        canvas,
        context,
        viewport,
        timestamp,
        elapsed,
      })
      if (!controller.signal.aborted) {
        window.requestAnimationFrame(wrap)
      }
    }
    window.requestAnimationFrame(wrap)

    return () => {
      ro.disconnect()
      controller.abort()
    }
  }, [canvas])

  useEffect(() => {
    // prevent scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return <Canvas ref={setCanvas} />
}
