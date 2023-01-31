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

function move(elapsed: Milliseconds) {
  position = position.add(velocity.mul(elapsed / 1000))
}

const render: RenderFn = ({ context, viewport, debug, elapsed }) => {
  move(elapsed)

  context.clearRect(0, 0, viewport.w, viewport.h)

  const size = 20

  debug('position', position.toString())

  const numCols = Math.ceil(viewport.w / size)
  const numRows = Math.ceil(viewport.h / size)

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      const color = state.get(col, row)
      if (!color) {
        continue
      }
      context.fillStyle = color
      const x = size * col,
        y = size * row,
        w = size,
        h = size
      context.fillRect(x, y, w, h)
    }
  }

  if (pointer) {
    const { x, y } = pointer
    context.beginPath()
    context.strokeStyle = 'white'
    context.arc(x, y, 20, 0, Math.PI * 2)
    context.stroke()
  }
}

export function Draw() {
  return <Engine render={render} init={init} />
}
