import { handleWheel } from './camera.js'
import { InitFn } from './types.js'

export const initWheel: InitFn = async (state) => {
  const { canvas, signal } = state
  canvas.cpu.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      handleWheel(state, e)
    },
    {
      signal,
      passive: false,
    },
  )
}
