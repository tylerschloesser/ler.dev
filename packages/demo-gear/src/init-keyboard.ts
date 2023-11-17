import { InitFn, PointerType } from './types.js'

export const initKeyboard: InitFn = ({
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
