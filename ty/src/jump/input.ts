import { Vec2 } from '../common/vec2'
import { state } from './state'

export function handlePointer(e: PointerEvent) {
  state.pointer = new Vec2(e.clientX, e.clientY)
}
