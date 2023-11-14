import { PointerType, initKeyboardFn } from './types.js'

export const initKeyboard: initKeyboardFn = ({
  signal,
  pointer,
}) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        pointer.current = {
          type: PointerType.Null,
          state: null,
        }
      }
    },
    { signal },
  )
}
