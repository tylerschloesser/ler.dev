import { Engine, InitFn } from '../common/engine/index.js'
import { initInput } from './input.js'
import { render } from './render.js'
import { addTargetPair, state } from './state.js'

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
