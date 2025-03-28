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

interface CellAnimation {
  direction: 'forwards' | 'backwards'
  duration: number
  current: number
  fromOpacity: number
  toOpacity: number
}

interface Cell {
  g: Graphics
  animation?: CellAnimation
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

      const rect = container.current.getBoundingClientRect()
      const viewport = new Vec2(rect.width, rect.height)

      // edge case...
      if (viewport.x === 0 || viewport.y === 0) {
        return
      }

      const cellSize = Math.ceil(
        Math.min(viewport.x, viewport.y) * 0.2,
      )
      const numRows = Math.ceil(viewport.y / cellSize)
      const numCols = Math.ceil(viewport.x / cellSize)
      const cellContainer = app.stage.addChild(
        new Container({
          position: new Vec2(
            numCols * cellSize,
            numRows * cellSize,
          )
            .sub(viewport)
            .mul(-0.5),
        }),
      )

      const cells: Cell[] = []
      for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
          if (Math.random() < 0.5) {
            continue
          }
          const g = cellContainer.addChild(new Graphics())
          let animation: CellAnimation | undefined
          if (Math.random() < 0.5) {
            const duration = 1000 + Math.random() * 1000
            animation = {
              direction:
                Math.random() < 0.5
                  ? 'forwards'
                  : 'backwards',
              duration,
              current: Math.random() * duration,
              fromOpacity: 0,
              toOpacity: 1,
            }
          }
          cells.push({ g, animation })
          g.rect(
            x * cellSize,
            y * cellSize,
            cellSize,
            cellSize,
          )
          g.fill(`hsl(0, 50%, ${0 + Math.random() * 20}%)`)
        }
      }

      let lastFrame = self.performance.now()
      const callback: FrameRequestCallback = () => {
        const now = self.performance.now()
        const dt = Math.min(
          now - lastFrame,
          (1 / 30) * 1000,
        )
        lastFrame = now

        for (const cell of cells) {
          if (!cell.animation) {
            continue
          }
          const { animation } = cell
          if (animation.direction === 'forwards') {
            animation.current += dt
            if (animation.current > animation.duration) {
              animation.current = animation.duration
              animation.direction = 'backwards'
            }
          } else {
            invariant(animation.direction === 'backwards')
            animation.current -= dt
            if (animation.current < 0) {
              animation.current = 0
              animation.direction = 'forwards'
            }
          }

          cell.g.alpha =
            animation.fromOpacity +
            (animation.toOpacity - animation.fromOpacity) *
              (animation.current / animation.duration)
        }

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
