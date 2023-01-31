import React from 'react'
import { Engine, InitFn, Milliseconds, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import * as state from './state'

let pointer: Vec2 | null = null

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      pointer = new Vec2(e.clientX, e.clientY)
    },
    { signal },
  )
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
  move(elapsed)
  const cellSize = 20
  debug('position', position.toString())
  ;[
    () => {
      context.clearRect(0, 0, viewport.w, viewport.h)
    },
    () => {
      const numCols = Math.ceil(viewport.w / cellSize)
      const numRows = Math.ceil(viewport.h / cellSize)

      for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < numRows; row++) {
          const color = state.get(col, row)
          if (!color) {
            continue
          }
          context.fillStyle = color
          const x = cellSize * col,
            y = cellSize * row,
            w = cellSize,
            h = cellSize
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
