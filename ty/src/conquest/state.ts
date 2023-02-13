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
  ball: {
    p: new Vec2(50, 50),
    v: new Vec2(1, 0),
    color: 'orange',
    r: 15,
  },
}
