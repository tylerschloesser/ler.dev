import { InitFn, PointerMode } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.pointer.mode = PointerMode.Free
        state.hand = null
      }
    },
    { signal: state.signal },
  )
}
