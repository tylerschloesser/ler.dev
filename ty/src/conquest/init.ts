import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export const init: InitFn = ({ canvas, signal, updateConfig }) => {
  updateConfig((prev) => ({
    ...prev,
    debugFontColor: 'white',
  }))

  state.world.flags.push({
    color: 'red',
    r: 10,
    p: new Vec2(20, 20),
  })
  state.world.flags.push({
    color: 'green',
    r: 20,
    p: new Vec2(100, 50),
  })
  state.world.flags.push({
    color: 'blue',
    r: 60,
    p: new Vec2(300, 200),
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
      state.camera.zoom += e.deltaY / 100
    },
    { signal, passive: true },
  )
}
