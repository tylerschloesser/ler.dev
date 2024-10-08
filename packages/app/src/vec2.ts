export class Vec2 {
  readonly x: number
  readonly y: number
  constructor(x: number, y?: number) {
    this.x = x
    this.y = y ?? x
  }

  static ZERO = new Vec2(0, 0)

  mul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar)
  }

  div(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar)
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  equals(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  map(fn: (v: Vec2) => Vec2): Vec2 {
    return fn(this)
  }
}
