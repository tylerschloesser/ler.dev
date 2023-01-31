import React from 'react'
import { Engine, InitFn, RenderFn } from '../common/engine'

const render: RenderFn = () => {}

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      console.log(e.clientX, e.clientY)
    },
    { signal },
  )
}

export function Draw() {
  return <Engine render={render} init={init} />
}
