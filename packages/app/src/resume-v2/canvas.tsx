import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function Canvas() {
  const container = useRef<HTMLDivElement>(null)
  const interval = useRef<number | null>(null)
  const app = useRef<PIXI.Application | null>(null)
  const viewport = useViewport(container)
  useEffect(() => {
    if (!container.current) return

    const canvas = document.createElement('canvas')
    container.current.appendChild(canvas)

    app.current = new PIXI.Application()
    invariant(container.current)
    app.current
      .init({
        backgroundAlpha: 0,
        canvas,
      })
      .then(() => {
        interval.current = self.setInterval(() => {
          console.log('hi2')
        }, 100)
      })
    return () => {
      if (interval.current) {
        self.clearInterval(interval.current)
      }
      if (typeof app.current?.destroy === 'function') {
        app.current.destroy()
      }
      canvas.remove()
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
  return <div ref={container} className="w-full h-full" />
}

function useViewport(
  container: React.RefObject<HTMLDivElement>,
) {
  const [viewport, setViewport] = useState<Vec2 | null>(
    null,
  )
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { contentRect: rect } = entry
      setViewport(new Vec2(rect.width, rect.height))
    })
    invariant(container.current)
    ro.observe(container.current)
    return () => {
      ro.disconnect()
    }
  }, [])
  return viewport
}
