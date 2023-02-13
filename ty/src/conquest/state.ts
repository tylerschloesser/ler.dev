import { Vec2 } from '../common/vec2'
import { Pointer, State } from './types'

let pointer: Pointer = null

export const state: State = {
  pointer,
  world: {
    size: new Vec2(100, 100),
    flags: [],
  },
  camera: {
    p: new Vec2(0, 0),
    zoom: 1,
  },
  ball: {
    p: new Vec2(50, 50),
    v: new Vec2(2, 0),
    color: 'orange',
    r: 15,
  },
}
