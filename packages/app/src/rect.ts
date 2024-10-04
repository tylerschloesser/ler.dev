import { Vec2 } from './vec2'

export class Rect {
  readonly position: Vec2
  readonly size: Vec2

  constructor(position: Vec2, size: Vec2) {
    this.position = position
    this.size = size
  }
}
