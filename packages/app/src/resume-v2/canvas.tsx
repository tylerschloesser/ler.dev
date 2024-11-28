import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function Canvas() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const interval = useRef<number | null>(null)
  const app = useRef<PIXI.Application | null>(null)
  const viewport = useViewport(canvas)
  useEffect(() => {
    if (!canvas.current) return
    app.current = new PIXI.Application()
    invariant(canvas.current)
    app.current
      .init({
        backgroundAlpha: 0,
        canvas: canvas.current,
      })
      .then(() => {
        interval.current = self.setInterval(() => {
          console.log('hi4')
        }, 100)
      })
    return () => {
      if (interval.current) {
        self.clearInterval(interval.current)
      }
    }
  }, [])
  useEffect(() => {
    if (
      typeof app.current?.resize === 'function' &&
      viewport
    ) {
      app.current.resize()
    }
  }, [viewport])
  return (
    <canvas
      ref={canvas}
      className="w-full h-full"
      width={viewport?.x}
      height={viewport?.y}
    />
  )
}

function useViewport(
  canvas: React.RefObject<HTMLCanvasElement>,
) {
  const [viewport, setViewport] = useState<Vec2 | null>(
    null,
  )
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { contentRect: rect } = entry
      setViewport(new Vec2(rect.width, rect.height))
    })
    invariant(canvas.current)
    ro.observe(canvas.current)
    return () => {
      ro.disconnect()
    }
  }, [])
  return viewport
}
