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

function resize(container: HTMLDivElement, canvas: HTMLCanvasElement) {
  const rect = container.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export function Engine({ init, render }: EngineProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const [container, setContainer] = useState<HTMLDivElement | null>()
  const initialized = useRef(false)

  useEffect(() => {
    if (!canvas || !container || initialized.current) {
      return
    }

    initialized.current = true

    resize(container, canvas)
    const ro = new ResizeObserver(() => {
      resize(container, canvas)
    })
    ro.observe(container)

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

  return (
    <Container ref={setContainer}>
      <Canvas ref={setCanvas} />
    </Container>
  )
}
