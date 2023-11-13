import { State } from './types.js'

export const state: State = {
  pointer: null,
  drag: null,
  ball: null,
  targets: [],

  // to be set during init
  viewport: null!,
  camera: null!,
}
