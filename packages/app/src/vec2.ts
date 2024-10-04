export class Vec2 {
  readonly x: number
  readonly y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  div(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar)
  }
}
