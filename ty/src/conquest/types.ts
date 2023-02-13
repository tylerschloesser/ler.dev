import { Vec2 } from '../common/vec2'

export type Color = 'red' | 'white' | 'blue' | 'green'

export interface Flag {
  p: Vec2
  color: Color
}

export interface World {
  flags: Flag[]
}
