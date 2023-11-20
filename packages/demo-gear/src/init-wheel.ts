import { handleWheel } from './camera.js'
import { InitFn } from './types.js'

export const initWheel: InitFn = (state) => {
  const { canvas, signal } = state
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      handleWheel(e, state)
    },
    {
      signal,
      passive: false,
    },
  )
}
