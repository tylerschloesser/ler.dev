import { z } from 'zod'

export class Vec2 {
  readonly x: number
  readonly y: number

  constructor(v: ZodVec2)
  constructor(v: number)
  constructor(x: number, y: number)
  constructor(v: number | ZodVec2, y?: number) {
    if (typeof v === 'number') {
      this.x = v
      this.y = y ?? v
    } else {
      this.x = v.x
      this.y = v.y
    }
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

  normalize(): Vec2 {
    return this.div(this.len())
  }
}

export const ZodVec2 = z.strictObject({
  x: z.number(),
  y: z.number(),
})
export type ZodVec2 = z.infer<typeof ZodVec2>
