import { InitFn } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.build = null
        state.accelerate = null
      }
    },
    { signal: state.signal },
  )
}
