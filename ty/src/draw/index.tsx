import React from 'react'
import { Engine, InitFn, RenderFn } from '../common/engine'

const init: InitFn = () => {}

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  context.strokeStyle = 'green'
  context.strokeRect(0, 0, 100, 100)
}

export function Draw() {
  return <Engine init={init} render={render} />
}
