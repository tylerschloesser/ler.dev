import { updatePointerMode } from './pointer-mode.js'
import { InitFn, PointerMode } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.hand = null
        updatePointerMode(state, PointerMode.Free)
      }
    },
    { signal: state.signal },
  )
}
