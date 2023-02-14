import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export type Milliseconds = number

export type InitFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  viewport: Viewport
  signal: AbortSignal
  updateConfig(fn: (prev: RenderConfig) => RenderConfig): void
}) => void

export type RenderFn = (args: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  viewport: Viewport
  timestamp: Milliseconds
  elapsed: Milliseconds
  debug(key: string, value: string): void
  config: RenderConfig
}) => void

export interface EngineProps {
  init: InitFn
  render: RenderFn
  resize?(canvas: HTMLCanvasElement): void
}

export interface RenderConfig {
  showDebug: boolean
  showFps: boolean
  debugFontColor: string
}

export interface Viewport {
  w: number
  h: number
}

function defaultResize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`

const DEFAULT_CONFIG: RenderConfig = {
  showDebug: false,
  showFps: false,
  debugFontColor: 'black',
}

export function Engine({ init, render, resize = defaultResize }: EngineProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  const initialized = useRef(false)
  const config = useRef<RenderConfig>(DEFAULT_CONFIG)
  const controllerRef = useRef(new AbortController())

  // TODO add init and render to useEffect dependencies
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
    let viewport: Viewport = {
      w: canvas.width,
      h: canvas.height,
    }

    init({
      canvas,
      context,
      viewport,
      signal: controllerRef.current.signal,
      updateConfig(fn) {
        config.current = fn(config.current)
      },
    })

    let last: null | number = null
    let frames = 0
    let fps = 0

    function wrap(timestamp: number) {
      if (!canvas) {
        console.error('<canvas> no longer available')
        return
      }

      if (last && Math.floor(last / 1000) !== Math.floor(timestamp / 1000)) {
        fps = frames
        frames = 0
      }
      frames++

      let elapsed = last ? timestamp - last : 0
      last = timestamp

      viewport = {
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
        config: config.current,
      })

      if (config.current.showDebug) {
        context.lineWidth = 1
        context.strokeStyle = config.current.debugFontColor
        context.font = '16px sans-serif'
        let y = 16
        queue.forEach((value, key) => {
          context.strokeText(`${key}: ${value}`, 0, y)
          y += 16
        })
      }

      if (config.current.showFps) {
        context.lineWidth = 1
        context.strokeStyle = config.current.debugFontColor
        context.font = '16px sans-serif'
        const text = `FPS: ${fps}`
        const metrics = context.measureText(text)
        context.strokeText(text, viewport.w - metrics.width, 16)
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
      config.current = DEFAULT_CONFIG
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
