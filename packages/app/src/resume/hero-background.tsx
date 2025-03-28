import clsx from 'clsx'
import { Application, Container, Graphics } from 'pixi.js'
import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createNoise3D } from 'simplex-noise'
import invariant from 'tiny-invariant'
import { Vec2 } from '../vec2'

const noise3D = createNoise3D()

const SCALE_X = 0.4
const SCALE_Y = 0.4
const SCALE_Z = 0.1

const TICK_DURATION = 1000

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

interface Cell {
  g: Graphics
  position: Vec2
  fromOpacity: number
  toOpacity: number
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
      const cells = initCells({
        numRows,
        numCols,
        cellSize,
        cellContainer,
      })

      let lastFrame = self.performance.now()
      let lastTick = lastFrame
      let tick = 0
      const callback: FrameRequestCallback = () => {
        const now = self.performance.now()
        // @ts-expect-error
        const dt = Math.min(
          now - lastFrame,
          (1 / 30) * 1000,
        )
        lastFrame = now

        if (now - lastTick > TICK_DURATION) {
          lastTick = now
          tickCells(cells, ++tick)
        }

        const tickProgress =
          (now - lastTick) / TICK_DURATION
        invariant(tickProgress >= 0 && tickProgress <= 1)
        updateCells(cells, tickProgress)

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

interface InitCellsArgs {
  numRows: number
  numCols: number
  cellSize: number
  cellContainer: Container
}

function initCells({
  numRows,
  numCols,
  cellSize,
  cellContainer,
}: InitCellsArgs): Cell[] {
  const cells: Cell[] = []
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      const g = cellContainer.addChild(new Graphics())
      const position = new Vec2(x, y)
      const fromOpacity = 0
      const toOpacity = 0
      cells.push({ g, position, fromOpacity, toOpacity })
      g.rect(x * cellSize, y * cellSize, cellSize, cellSize)
      g.fill(`hsl(120, 50%, 20%)`)
    }
  }
  tickCells(cells, 0)
  return cells
}

function tickCells(cells: Cell[], tick: number) {
  for (const cell of cells) {
    cell.fromOpacity = cell.toOpacity
    cell.toOpacity = Math.max(
      0,
      noise3D(
        cell.position.x * SCALE_X,
        cell.position.y * SCALE_Y,
        tick * SCALE_Z,
      ),
    )
  }
}

function updateCells(cells: Cell[], tickProgress: number) {
  for (const cell of cells) {
    const opacity = lerp(
      cell.fromOpacity,
      cell.toOpacity,
      tickProgress,
    )
    cell.g.alpha = opacity
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
