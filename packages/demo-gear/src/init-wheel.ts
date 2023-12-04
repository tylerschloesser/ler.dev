import { handleWheel } from './camera.js'
import { InitFn } from './types.js'

export const initWheel: InitFn = async (context) => {
  const { canvas, signal } = context
  canvas.container.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      handleWheel(context, e)
    },
    {
      signal,
      passive: false,
    },
  )
}
