import * as PIXI from 'pixi.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createNoise4D } from 'simplex-noise'
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

interface Cell {
  id: string
  p: Vec2
  g: PIXI.Graphics
}

function* iterateViewport(
  sx: number,
  sy: number,
): Generator<Vec2> {
  for (let x = 0; x < sx; x += 1) {
    for (let y = 0; y < sy; y += 1) {
      yield new Vec2(x, y)
    }
  }
}

function useCells(viewport: Vec2, cellSize: number) {
  const sx = useMemo(
    () => Math.ceil(viewport.x / cellSize),
    [viewport.x, cellSize],
  )
  const sy = useMemo(
    () => Math.ceil(viewport.y / cellSize),
    [viewport.y, cellSize],
  )

  return useMemo(() => {
    const cells = new Map<string, Cell>()
    for (const p of iterateViewport(sx, sy)) {
      const id = `${p.x}.${p.y}`
      const g = new PIXI.Graphics()
      g.rect(
        p.x * cellSize,
        p.y * cellSize,
        cellSize,
        cellSize,
      )
      g.fill('blue')
      cells.set(id, { id, p, g })
    }
    return cells
  }, [sx, sy])
}

const O1_WEIGHT = 0.2
const O1_SCALE_V = 0
const O1_SCALE_XY = 0.7
const O1_SCALE_Z = 0.5

const O2_WEIGHT = 0.8
const O2_SCALE_V = 0.5
const O2_SCALE_XY = 0.09
const O2_SCALE_Z = 0.1

function Inner({ container, viewport }: InnerProps) {
  const [initialViewport] = useState(viewport)
  const [state, setState] = useState<InnerState | null>(
    null,
  )

  const [cellSize] = useState(
    () =>
      Math.min(initialViewport.x, initialViewport.y) / 16,
  )
  const cells = useCells(viewport, cellSize)

  useEffect(() => {
    if (!state) return

    state.app.stage.removeChildren()
    for (const cell of cells.values()) {
      state.app.stage.addChild(cell.g)
    }

    let handle: number | undefined
    const noise = createNoise4D()
    const v = new Vec2(1, 1).normalize()
    function step() {
      const t = self.performance.now() / 1000
      const d1 = v.mul(t * O1_SCALE_V)
      const d2 = v.mul(t * O2_SCALE_V)
      for (const cell of cells.values()) {
        const p1 = cell.p.add(d1)
        const o1 = noise(
          p1.x * O1_SCALE_XY,
          p1.y * O1_SCALE_XY,
          t * O1_SCALE_Z,
          1,
        )
        const p2 = cell.p.add(d2)
        const o2 =
          noise(
            p2.x * O2_SCALE_XY,
            p2.y * O2_SCALE_XY,
            t * O2_SCALE_Z,
            2,
          ) ** 0.8

        const n = o1 * O1_WEIGHT + o2 * O2_WEIGHT

        if (n < 0) {
          cell.g.tint = 0x000000
        } else {
          const a = (n * 0xff) << 0
          const b = (n * 0xff) << 8
          const c = (n * 0xff) << 16

          cell.g.tint = a | b | c
        }
      }
      handle = self.requestAnimationFrame(step)
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      if (handle) {
        self.cancelAnimationFrame(handle)
      }
    }
  }, [state])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    invariant(container.current)
    container.current.appendChild(canvas)

    const app = new PIXI.Application()
    app
      .init({
        backgroundAlpha: 0,
        canvas,
        width: initialViewport.x,
        height: initialViewport.y,
      })
      .then(() => {
        setState({ canvas, app })
      })

    return () => {
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
