import clsx from 'clsx'
import { Application, Container, Graphics } from 'pixi.js'
import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from '../vec2'

export default function HeroBackground() {
  const container = useRef<HTMLDivElement>(null)
  const { ready } = useBackground(container)
  return (
    <div
      ref={container}
      className={clsx(
        'absolute inset-0',
        'transition-opacity duration-1000 ease-out',
        ready ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

function useBackground(
  container: RefObject<HTMLDivElement>,
): { ready: boolean } {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const app = new Application()
    invariant(container.current)
    const promise = app.init({
      canvas,
      antialias: true,
      eventMode: 'none',
      backgroundAlpha: 0,
      resizeTo: container.current,
    })
    const controller = new AbortController()

    let handle: number

    promise.then(() => {
      const { signal } = controller
      if (signal.aborted) {
        return
      }
      invariant(container.current)
      container.current.appendChild(canvas)

      const viewport = new Vec2(
        app.canvas.width,
        app.canvas.height,
      )

      const cellSize = Math.ceil(
        Math.min(viewport.x, viewport.y) * 0.2,
      )
      const numRows = Math.ceil(viewport.y / cellSize)
      const numCols = Math.ceil(viewport.x / cellSize)
      const cellContainer = app.stage.addChild(
        new Container(),
      )

      for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
          if (Math.random() < 0.5) {
            continue
          }
          const g = cellContainer.addChild(new Graphics())
          g.rect(
            x * cellSize,
            y * cellSize,
            cellSize,
            cellSize,
          )
          g.fill(`hsl(0, 50%, ${50 + Math.random() * 50}%)`)
        }
      }

      let lastFrame = self.performance.now()
      const callback: FrameRequestCallback = () => {
        const now = self.performance.now()
        // @ts-expect-error
        const dt = Math.min(
          now - lastFrame,
          (1 / 30) * 1000,
        )
        lastFrame = now

        handle = self.requestAnimationFrame(callback)
      }
      handle = self.requestAnimationFrame(callback)

      setReady(true)
    })
    return () => {
      controller.abort()
      self.cancelAnimationFrame(handle)
      promise.then(() => app.destroy())
      canvas.remove()
    }
  }, [])
  return { ready }
}
