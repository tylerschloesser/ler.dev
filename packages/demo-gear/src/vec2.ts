import invariant from 'tiny-invariant'
import { SimpleVec2 } from './types.js'

export class Vec2 {
  x: number
  y: number

  constructor(x: number | SimpleVec2, y?: number) {
    if (typeof x === 'number') {
      this.x = x
      this.y = y ?? x
    } else {
      this.x = x.x
      this.y = x.y
    }
  }

  add(v: Vec2 | number): Vec2 {
    if (typeof v === 'number') {
      return new Vec2(this.x + v, this.y + v)
    }
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }

  div(s: number): Vec2 {
    invariant(s !== 0)
    return new Vec2(this.x / s, this.y / s)
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  norm(): Vec2 {
    return this.div(this.len())
  }

  angle(): number {
    // invariant(this.len() === 1)
    return Math.atan2(this.y, this.x)
  }

  rotate(angle: number): Vec2 {
    return new Vec2(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle),
    )
  }

  floor(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y))
  }

  static equal(
    a: Vec2 | SimpleVec2,
    b: Vec2 | SimpleVec2,
  ): boolean {
    return a.x === b.x && a.y === b.y
  }
}
