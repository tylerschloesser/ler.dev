import { HoverType, InitFn } from './types.js'

export const initKeyboard: InitFn = (state) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        state.hover = { type: HoverType.Null }
      }
    },
    { signal: state.signal },
  )
}
