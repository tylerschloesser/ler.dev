import React, { useEffect, useRef, useState } from 'react'

function handleResize(canvas: HTMLCanvasElement) {
  updateViewport({
    w: window.innerWidth,
    h: window.innerHeight,
  })

  canvas.width = viewport.w
  canvas.height = viewport.h
}

export function initResizeObserver(canvas: HTMLCanvasElement): () => void {
  const ro: ResizeObserver = new ResizeObserver(() => {
    handleResize(canvas)
  })
  ro.observe(document.body)
  return () => {
    ro.disconnect()
  }
}

export type InitFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}) => void

export type RenderFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
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

export let viewport: Viewport = {
  w: window.innerWidth,
  h: window.innerHeight,
}

export function updateViewport(next: Viewport) {
  viewport = next
}

export function Engine({ init, render }: EngineProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const initialized = useRef(false)

  useEffect(() => {
    let cleanup: () => void | undefined
    if (canvas && !initialized.current) {
      initialized.current = true

      canvas.width = viewport.w
      canvas.height = viewport.h

      const context = canvas.getContext('2d')!
      cleanup = initResizeObserver(canvas)

      init({ canvas, context })

      let last: null | number = null
      function wrap(timestamp: number) {
        let elapsed = (last ? timestamp - last : 0) / 1000
        last = timestamp
        render({ canvas: canvas!, context, timestamp, elapsed })
        window.requestAnimationFrame(wrap)
      }
      window.requestAnimationFrame(wrap)
    }

    // prevent scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      cleanup?.()
    }
  }, [canvas])

  return (
    <div>
      <canvas ref={setCanvas} />
    </div>
  )
}