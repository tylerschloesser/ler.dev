import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

// @refresh reset

export function Canvas() {
  const container = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)
  const app = useRef<PIXI.Application | null>(null)
  const viewport = useViewport(container)

  useEffect(() => {
    if (!container.current) return
    const canvas = document.createElement('canvas')
    container.current.appendChild(canvas)
    setCanvas(canvas)
    return () => {
      canvas.remove()
      setCanvas(null)
    }
  }, [])

  useEffect(() => {
    if (canvas && viewport) {
      canvas.width = viewport.x
      canvas.height = viewport.y
      if (typeof app.current?.resize === 'function') {
        app.current.resize()
      }
    }
  }, [canvas, viewport])

  useEffect(() => {
    if (!canvas) return

    let interval: number | undefined
    app.current = new PIXI.Application()
    app.current
      .init({
        backgroundAlpha: 0,
        canvas,
      })
      .then(() => {
        interval = self.setInterval(() => {
          console.log('hi3')
        }, 100)
      })
    return () => {
      self.clearInterval(interval)
      if (typeof app.current?.destroy === 'function') {
        app.current.destroy()
      }
      app.current = null
    }
  }, [canvas])

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
