import React from 'react'
import { Engine, InitFn } from '../common/engine'
import { initInput } from './input'
import { render } from './render'
import { addTargetPair, state } from './state'

const TARGET_PAIRS = 100

const init: InitFn = ({ canvas }) => {
  initInput(canvas)

  for (let i = 0; i < TARGET_PAIRS; i++) {
    addTargetPair(state.targets)
  }
}

export function Ball1() {
  return <Engine init={init} render={render} />
}
