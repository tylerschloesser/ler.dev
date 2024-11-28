import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

// @refresh reset

interface InnerState {
  canvas: HTMLCanvasElement
  app: PIXI.Application
}

interface InnerProps {
  container: React.RefObject<HTMLDivElement>
  viewport: Vec2
}

function Inner({ container, viewport }: InnerProps) {
  const [initialViewport] = useState(viewport)
  const [state, setState] = useState<InnerState | null>(
    null,
  )

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    invariant(container.current)
    container.current.appendChild(canvas)

    const app = new PIXI.Application()
    let interval: number | undefined
    app
      .init({
        backgroundAlpha: 0,
        canvas,
        width: initialViewport.x,
        height: initialViewport.y,
      })
      .then(() => {
        interval = self.setInterval(() => {
          console.log('internval!')
          const g = new PIXI.Graphics()
          app.stage.addChild(g)
          g.rect(0, 0, 100, 100)
          g.fill('blue')
        }, 100)
      })

    setState({ canvas, app })

    return () => {
      self.clearInterval(interval)
      if (typeof app.destroy === 'function') {
        app.destroy()
      }
      canvas.remove()
      setState(null)
    }
  }, [initialViewport])

  useEffect(() => {
    if (!state) return
    state.canvas.width = viewport.x
    state.canvas.height = viewport.y
    if (typeof state.app.resize === 'function') {
      state.app.resize()
    }
  }, [viewport, state])

  return null
}

export function Canvas() {
  const container = useRef<HTMLDivElement>(null)
  const viewport = useViewport(container)
  return (
    <div
      ref={container}
      className="w-full h-full relative overflow-hidden"
    >
      {viewport && (
        <Inner container={container} viewport={viewport} />
      )}
    </div>
  )
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
