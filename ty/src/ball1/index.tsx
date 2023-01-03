import React from 'react'
import { Engine, InitFn } from '../common/engine'
import { initInput, initResizeObserver } from './input'
import { buildRender } from './render'
import { addTargetPair, state, viewport } from './state'

const TARGET_PAIRS = 100

const init: InitFn = (canvas, context) => {
  initInput(canvas)

  for (let i = 0; i < TARGET_PAIRS; i++) {
    addTargetPair(state.targets)
  }

  canvas.width = viewport.w
  canvas.height = viewport.h

  window.requestAnimationFrame(buildRender(context))

  const cleanupResizeObserver = initResizeObserver(canvas)

  return {
    cleanup() {
      cleanupResizeObserver()
    },
  }
}

export function Ball1() {
  return <Engine init={init} />
}
