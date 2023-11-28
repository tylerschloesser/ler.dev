import { InitFn } from './types.js'

export const initKeyboard: InitFn = async (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.navigate('/gears')
      }
    },
    { signal: state.signal },
  )
}
