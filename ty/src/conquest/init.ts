import { InitFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'

export const init: InitFn = ({ canvas, signal }) => {
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

  canvas.addEventListener(
    'pointermove',
    (e) => {
      const { clientX: x, clientY: y } = e
      state.pointer = new Vec2(x, y)
    },
    { signal },
  )
}
