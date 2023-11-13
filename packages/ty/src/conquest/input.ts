import { Vec2 } from '../common/vec2.js'
import { state } from './state.js'

export const handlePointer = (e: PointerEvent) => {
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
      state.ball.v = state.drag.b
        .sub(state.drag.a)
        .mul(-1)
        .mul(1 / state.camera.zoom)
    } else if (state.drag?.a) {
      // single click stops the ball
      state.ball.v = new Vec2(0, 0)
    }
    state.drag = null
  }
}

export const handleWheel = (e: WheelEvent) => {
  state.camera.zoom += e.deltaY * 0.001 * -1
  state.camera.zoom = Math.max(state.camera.zoom, 1)
}
