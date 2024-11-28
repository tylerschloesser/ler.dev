import * as PIXI from 'pixi.js'
import { useEffect, useMemo, useRef, useState } from 'react'
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

function Inner({ container, viewport }: InnerProps) {
  const [initialViewport] = useState(viewport)
  const [state, setState] = useState<InnerState | null>(
    null,
  )

  const [cellSize] = useState(
    () =>
      Math.min(initialViewport.x, initialViewport.y) / 10,
  )
  const cells = useCells(viewport, cellSize)

  useEffect(() => {
    if (!state) return

    state.app.stage.removeChildren()
    for (const cell of cells.values()) {
      state.app.stage.addChild(cell.g)
    }

    const interval = self.setInterval(() => {
      for (const cell of cells.values()) {
        cell.g.tint = Math.random() * 0xffffff
      }
    }, 100)
    return () => {
      self.clearInterval(interval)
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
