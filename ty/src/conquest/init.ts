import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export const init: InitFn = ({ canvas, signal }) => {
  state.world.flags.push({
    color: 'red',
    r: 10,
    p: new Vec2(0, 0),
  })

  canvas.addEventListener(
    'pointermove',
    (e) => {
      const { clientX: x, clientY: y } = e
      state.pointer = new Vec2(x, y)
    },
    { signal },
  )
}
