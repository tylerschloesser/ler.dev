export class Vec2 {
  readonly x: number
  readonly y: number
  constructor(x: number, y?: number) {
    this.x = x
    this.y = y ?? x
  }

  static ZERO = new Vec2(0, 0)

  div(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar)
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
}
