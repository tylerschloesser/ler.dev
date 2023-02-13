import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const { clientX: x, clientY: y } = e
      state.pointer = new Vec2(x, y)
    },
    { signal },
  )
}
