import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { addFlag, state } from './state'
import { Color } from './types'

function generateFlags() {
  const count = Math.ceil(
    Math.sqrt(state.world.size.x * state.world.size.y) * 0.05,
  )
  console.debug(`Generating ${count} flags`)

  const COLORS: Color[] = ['red', 'green', 'blue']
  for (let i = 0; i < count; i++) {
    do {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const r = 10 + Math.floor(Math.random() * 40)
      const p = new Vec2(
        Math.random() * state.world.size.x,
        Math.random() * state.world.size.y,
      )

      if (
        state.world.flags.every((flag) => {
          const dist = flag.p.sub(p).length()
          const BUFFER = 20
          return dist - flag.r - r - BUFFER > 0
        })
      ) {
        addFlag({ color, r, p })
        break
      }
    } while (true)
  }
}

export const init: InitFn = ({ canvas, signal, updateConfig }) => {
  updateConfig((prev) => ({
    ...prev,
    showDebug: true,
    showFps: true,
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

  const handlePointer = (e: PointerEvent) => {
    const { clientX: x, clientY: y } = e
    state.pointer = new Vec2(x, y)

    if (e.pressure) {
      if (state.drag?.a) {
        state.drag.b = new Vec2(x, y)
      } else {
        state.drag = {
          a: new Vec2(x, y),
          b: null,
        }
      }
    } else if (e.type === 'pointerup') {
      if (state.drag?.b) {
        state.ball.v = state.drag.b.sub(state.drag.a).mul(-1)
      }
      state.drag = null
    }
  }

  canvas.addEventListener('pointermove', handlePointer, { signal })
  canvas.addEventListener('pointerup', handlePointer, { signal })

  canvas.addEventListener(
    'wheel',
    (e) => {
      state.camera.zoom += e.deltaY * 0.001 * -1
      state.camera.zoom = Math.max(state.camera.zoom, 1)
    },
    { signal, passive: true },
  )
}
