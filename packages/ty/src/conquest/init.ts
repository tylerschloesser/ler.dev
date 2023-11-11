import { InitFn } from '../common/engine'
import { generateFlags } from './generate-flags'
import { handlePointer, handleWheel } from './input'

export const init: InitFn = ({ canvas, signal, updateConfig }) => {
  const showDebug = location.hostname === 'localhost'
  const showFps = true

  updateConfig((prev) => ({
    ...prev,
    showDebug,
    showFps,
    debugFontColor: 'white',
  }))

  generateFlags()

  window.addEventListener('keydown', (e) => {
    if (e.key === 'd') {
      updateConfig((prev) => ({
        ...prev,
        showDebug: !prev.showDebug,
        showFps: !prev.showFps,
      }))
    }
  })

  canvas.addEventListener('pointerdown', handlePointer, { signal })
  canvas.addEventListener('pointermove', handlePointer, { signal })
  canvas.addEventListener('pointerup', handlePointer, { signal })
  canvas.addEventListener('wheel', handleWheel, { signal, passive: true })
}
