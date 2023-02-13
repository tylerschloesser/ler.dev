import { Vec2 } from '../common/vec2'

export type Color = 'red' | 'white' | 'blue' | 'green'

export interface Flag {
  p: Vec2
  color: Color
}

export interface World {
  flags: Flag[]
}

export type Pointer = Vec2 | null

export interface State {
  pointer: Pointer
  world: World
}
