import { Vec2 } from '../common/vec2'
import { Flag, State } from './types'

export const state: State = {
  pointer: null,
  world: {
    size: new Vec2(300, 300),
    flags: [],
  },
  camera: {
    p: new Vec2(0, 0),
    zoom: 1,
  },
  ball: {
    p: new Vec2(50, 50),
    v: new Vec2(40, 0),
    color: 'orange',
    r: 15,
  },
}

export function addFlag(flag: Flag) {
  if (
    flag.p.x < 0 ||
    flag.p.y < 0 ||
    flag.p.x >= state.world.size.x ||
    flag.p.y >= state.world.size.y
  ) {
    throw Error(`Invalid flag position: ${flag.p.toString()}`)
  }
  state.world.flags.push(flag)
}
