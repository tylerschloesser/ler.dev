import { InitFn } from '../common/engine'
import { handlePointer } from './input'
import { state } from './state'

export const init: InitFn = ({ canvas, signal, viewport }) => {
  // TODO update viewport
  state.viewport = viewport

  canvas.addEventListener('pointerdown', handlePointer, { signal })
  canvas.addEventListener('pointermove', handlePointer, { signal })
  canvas.addEventListener('pointerup', handlePointer, { signal })
}
