import React from 'react'
import { Engine, InitFn, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'

let pointer: Vec2 | null = null

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const { clientX: x, clientY: y } = e
      pointer = new Vec2(x, y)
    },
    { signal },
  )
}

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)
  if (pointer) {
    const { x, y } = pointer
    context.strokeStyle = 'white'
    context.lineWidth = 2
    context.beginPath()
    context.arc(x, y, 20, 0, Math.PI * 2)
    context.stroke()
  }
}

export function Conquest() {
  return <Engine init={init} render={render} />
}
