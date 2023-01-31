import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export type Milliseconds = number

export type InitFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  signal: AbortSignal
}) => void

export type RenderFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  viewport: Viewport
  timestamp: Milliseconds
  elapsed: Milliseconds
  debug(key: string, value: string): void
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
  const controllerRef = useRef(new AbortController())

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

    const context = canvas.getContext('2d')!

    init({ canvas, context, signal: controllerRef.current.signal })

    let last: null | number = null
    function wrap(timestamp: number) {
      if (!canvas) {
        console.error('<canvas> no longer available')
        return
      }

      let elapsed = last ? timestamp - last : 0
      last = timestamp
      const viewport: Viewport = {
        w: canvas.width,
        h: canvas.height,
      }
      const queue = new Map<string, string>()
      render({
        canvas,
        context,
        viewport,
        timestamp,
        elapsed,
        debug(key, value) {
          queue.set(key, value)
        },
      })

      {
        context.font = '16px sans-serif'
        let y = 16
        queue.forEach((value, key) => {
          context.strokeText(`${key}: ${value}`, 0, y)
          y += 16
        })
      }

      if (!controllerRef.current.signal.aborted) {
        window.requestAnimationFrame(wrap)
      }
    }
    window.requestAnimationFrame(wrap)

    return () => {
      ro.disconnect()
    }
  }, [canvas])

  useEffect(() => {
    if (controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController()
    }
    return () => {
      console.debug('aborting')
      controllerRef.current.abort()
      initialized.current = false
    }
  }, [])

  useEffect(() => {
    // prevent scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return <Canvas ref={setCanvas} />
}
