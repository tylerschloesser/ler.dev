import invariant from 'tiny-invariant'
import { render } from './render.js'
import { InitFn } from './types.js'

export const initCanvas: InitFn = (state) => {
  const { canvas, signal } = state

  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')

  function handleFrame() {
    if (signal.aborted) {
      return
    }
    invariant(context)
    render(state, context)
    window.requestAnimationFrame(handleFrame)
  }
  window.requestAnimationFrame(handleFrame)
}
