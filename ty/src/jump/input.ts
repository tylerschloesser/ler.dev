import { Vec2 } from '../common/vec2'
import { state } from './state'

export function handlePointer(e: PointerEvent) {
  const p = new Vec2(e.x, e.y)
  state.pointer = p

  console.log(e.type)
  switch (e.type) {
    case 'pointerdown': {
      state.drag = {
        a: p,
        b: null,
      }
      break
    }
    case 'pointermove': {
      if (state.drag?.a) {
        state.drag.b = p
      }
      break
    }
    case 'pointerup': {
      state.drag = null
      break
    }
  }
}
