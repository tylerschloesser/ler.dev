import { InitFn } from '../common/engine'
import { handlePointer } from './input'

export const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener('pointerup', handlePointer, { signal })
  canvas.addEventListener('pointermove', handlePointer, { signal })
  canvas.addEventListener('pointerup', handlePointer, { signal })
}
