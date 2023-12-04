import { InitFn } from './types.js'

export const initKeyboard: InitFn = async (context) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        context.navigate('/gears')
      }
    },
    { signal: context.signal },
  )
}
