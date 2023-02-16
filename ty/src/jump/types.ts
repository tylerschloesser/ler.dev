import { Vec2 } from 'three'

export interface Drag {
  a: Vec2
  b: Vec2 | null
}

export interface State {
  pointer: Vec2 | null
  drag: Drag | null
}
