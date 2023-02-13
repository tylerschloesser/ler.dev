import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { addFlag, state } from './state'

export const init: InitFn = ({ canvas, signal, updateConfig }) => {
  updateConfig((prev) => ({
    ...prev,
    showDebug: true,
    showFps: true,
    debugFontColor: 'white',
  }))

  addFlag({
    color: 'red',
    r: 10,
    p: new Vec2(20, 20),
  })
  addFlag({
    color: 'green',
    r: 20,
    p: new Vec2(100, 50),
  })
  addFlag({
    color: 'blue',
    r: 60,
    p: new Vec2(290, 200),
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'd') {
      updateConfig((prev) => ({
        ...prev,
        showDebug: !prev.showDebug,
        showFps: !prev.showFps,
      }))
    }
  })

  canvas.addEventListener(
    'pointermove',
    (e) => {
      const { clientX: x, clientY: y } = e
      state.pointer = new Vec2(x, y)
    },
    { signal },
  )

  canvas.addEventListener(
    'wheel',
    (e) => {
      state.camera.zoom += e.deltaY * 0.001 * -1
      state.camera.zoom = Math.max(state.camera.zoom, 1)
    },
    { signal, passive: true },
  )
}
