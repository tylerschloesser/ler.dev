import { moveCamera } from './camera.js'
import { InitFn } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.hand = null
        state.pointerListeners.clear()
        state.pointerListeners.add(moveCamera)
      }
    },
    { signal: state.signal },
  )
}
