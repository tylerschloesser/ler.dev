import { InitFn } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.pointer = null
      }
    },
    { signal: state.signal },
  )
}
