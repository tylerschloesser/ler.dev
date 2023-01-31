import React from 'react'
import { Engine, InitFn, Milliseconds, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import * as state from './state'

let pointer: Vec2 | null = null
let pause = false
let position: Vec2 = new Vec2(0, 0)
let velocity: Vec2 = new Vec2(100, 33)

const init: InitFn = ({ canvas, viewport, signal, updateConfig }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      pointer = new Vec2(e.clientX, e.clientY)
      const center = new Vec2(viewport.w / 2, viewport.h / 2)
      velocity = pointer.sub(center).norm().mul(100)
    },
    { signal },
  )
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      pause = !pause
    }
    if (e.key === 'd') {
      updateConfig((prev) => ({
        ...prev,
        showDebug: !prev.showDebug,
        showFps: !prev.showFps,
      }))
    }
  })
}

function toSeconds(ms: Milliseconds): number {
  return ms / 1000
}

function move(elapsed: Milliseconds) {
  position = position.add(velocity.mul(toSeconds(elapsed)))
}

const render: RenderFn = ({ context, viewport, debug, elapsed }) => {
  if (!pause) {
    move(elapsed)
  }
  const cellSize = 20
  debug('pause', pause.toString())
  debug('position', position.toString())
  ;[
    () => {
      context.clearRect(0, 0, viewport.w, viewport.h)
    },
    () => {
      // add 1 to compensate for offset
      const numCols = Math.ceil(viewport.w / cellSize) + 1
      const numRows = Math.ceil(viewport.h / cellSize) + 1
      debug('numCols', numCols.toString())
      debug('numRows', numRows.toString())

      // TODO make sure this works with negative numbers
      const firstCol = Math.floor(Math.round(position.x) / cellSize)
      const firstRow = Math.floor(Math.round(position.y) / cellSize)
      debug('firstCol', firstCol.toString())
      debug('firstRow', firstRow.toString())

      const offset = new Vec2(firstCol * cellSize, firstRow * cellSize)
        .add(
          new Vec2(
            Math.round(position.x) % cellSize,
            Math.round(position.y) % cellSize,
          ),
        )
        .mul(-1)
      debug('offset', offset.toString())

      for (let col = firstCol; col < firstCol + numCols; col++) {
        for (let row = firstRow; row < firstRow + numRows; row++) {
          const color = state.get(col, row)
          if (!color) {
            continue
          }
          context.fillStyle = color

          const { x, y } = offset.add(new Vec2(cellSize * col, cellSize * row))

          const w = cellSize
          const h = cellSize
          context.fillRect(x, y, w, h)
        }
      }
    },
    () => {
      if (pointer) {
        const { x, y } = pointer
        context.beginPath()
        context.strokeStyle = 'white'
        context.arc(x, y, 20, 0, Math.PI * 2)
        context.stroke()
      }
    },
  ].forEach((fn) => fn())
}

export function Draw() {
  return <Engine render={render} init={init} />
}
