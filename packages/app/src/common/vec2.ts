export class Vec2 {
  x: number
  y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }

  div(s: number): Vec2 {
    return new Vec2(this.x / s, this.y / s)
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  toString(): string {
    return `[${Math.round(this.x)},${Math.round(this.y)}]`
  }

  rotate(angle: number): Vec2 {
    return new Vec2(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle),
    )
  }

  norm(): Vec2 {
    const length = this.length()
    if (length === 0) {
      return new Vec2(0, 0)
    }
    return new Vec2(this.x / length, this.y / length)
  }
}
