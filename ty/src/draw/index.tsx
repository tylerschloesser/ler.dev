import React from 'react'
import { Engine, InitFn, RenderFn } from '../common/engine'
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

  {
    const id = window.setInterval(() => {
      state.debug.reset()
    }, 10)
    signal.addEventListener('abort', () => {
      window.clearInterval(id)
    })
  }
}

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  for (let col = 0; col < state.size().cols; col++) {
    for (let row = 0; row < state.size().rows; row++) {
      const color = state.get(col, row)
      if (!color) {
        continue
      }
      context.fillStyle = color
      const size = 4
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
