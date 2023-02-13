import { Vec2 } from '../common/vec2'
import { Pointer, State } from './types'

let pointer: Pointer = null

export const state: State = {
  pointer,
  world: {
    flags: [],
  },
  camera: {
    p: new Vec2(0, 0),
    zoom: 1,
  },
}
