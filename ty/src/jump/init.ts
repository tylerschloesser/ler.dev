import { InitFn } from '../common/engine'
import { handlePointer } from './input'
import { state } from './state'

export const init: InitFn = ({ canvas, signal, viewport, updateConfig }) => {
  // TODO update viewport
  state.viewport = viewport

  updateConfig((prev) => ({
    ...prev,
    showFps: true,
    debugFontColor: 'white',
  }))

  canvas.addEventListener('pointerdown', handlePointer, { signal })
  canvas.addEventListener('pointermove', handlePointer, { signal })
  canvas.addEventListener('pointerup', handlePointer, { signal })
}
