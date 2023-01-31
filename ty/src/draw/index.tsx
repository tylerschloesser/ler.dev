import React from 'react'
import { Engine, InitFn, Milliseconds, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import * as state from './state'

let pointer: Vec2 | null = null
let pause = false

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      pointer = new Vec2(e.clientX, e.clientY)
    },
    { signal },
  )
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      pause = !pause
    }
  })
}

let position: Vec2 = new Vec2(0, 0)
let velocity: Vec2 = new Vec2(5, 0)

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
      const numCols = Math.ceil(viewport.w / cellSize)
      const numRows = Math.ceil(viewport.h / cellSize)
      debug('numRows', numRows.toString())
      debug('numCols', numCols.toString())

      // TODO make sure this works with negative numbers
      const firstCol = Math.round(position.x / numCols)
      const firstRow = Math.round(position.y / numRows)
      debug('firstRow', firstRow.toString())
      debug('firstCol', firstCol.toString())

      const offset = new Vec2(firstCol * numCols, firstRow * numRows)
        //.add(new Vec2(position.x % numCols, position.y % numRows))
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
          // const x = cellSize * col
          // const y = cellSize * row

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
