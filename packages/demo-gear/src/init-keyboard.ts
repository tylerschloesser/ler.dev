import { moveCamera } from './camera.js'
import { InitFn, PointerMode } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.hand = null
        state.pointerMode = PointerMode.Free
        state.pointerListeners.clear()
        state.pointerListeners.add(moveCamera)
      }
    },
    { signal: state.signal },
  )
}
