import { Vec2 } from '../common/vec2.js'

export interface Drag {
  a: Vec2
  b?: Vec2
}

export interface Ball {
  p: Vec2
  v: Vec2
  r: number
}

export interface World {
  w: number
  h: number
}

export interface Target {
  p: Vec2
  v: Vec2
  r: number
  hit: boolean
}

export interface State {
  ball: Ball
  drag?: Drag
  world: World
  targets: [Target, Target][]
}

const WORLD_SIZE = 10_000

export const state: State = {
  world: {
    w: WORLD_SIZE,
    h: WORLD_SIZE,
  },
  ball: {
    p: new Vec2(WORLD_SIZE / 2, WORLD_SIZE / 2),
    v: new Vec2(0, 0),
    r: 20,
  },
  targets: [],
}

export let scale = 1

export function adjustScale(dy: number) {
  scale += dy * 0.001
  scale = Math.max(scale, 0.2)
}

export function addTargetPair(targets: [Target, Target][]) {
  let a: Vec2

  const padding =
    Math.min(state.world.w, state.world.h) * 0.1
  const isValid = (v: Vec2) => {
    if (
      v.x < padding ||
      state.world.w - v.x < padding ||
      v.y < padding ||
      state.world.h - v.y < padding
    ) {
      return false
    }

    const dist = state.ball.p.sub(a).length()
    if (dist > padding) {
      return true
    }

    return false
  }

  let attempts = 0
  while (true) {
    a = new Vec2(
      Math.random() * state.world.w,
      Math.random() * state.world.h,
    )

    if (isValid(a)) {
      break
    }

    if (++attempts > 10) {
      throw Error(
        'Exceeded 10 attempts while generating target pair',
      )
    }
  }

  attempts = 0
  let b: Vec2
  while (true) {
    b = new Vec2(0, 1).rotate(Math.random() * 2 * Math.PI)
    b = a.add(b.mul(100 + Math.random() * 200))

    if (isValid(b)) {
      break
    }

    if (++attempts > 10) {
      throw Error(
        'Exceeded 10 attempts while generating target pair',
      )
    }
  }

  targets.push([
    {
      p: a,
      v: new Vec2(0, 1)
        .rotate(Math.random() * 2 * Math.PI)
        .mul(10 + Math.random() * 20),
      r: 20,
      hit: false,
    },
    {
      p: b,
      v: new Vec2(0, 1)
        .rotate(Math.random() * 2 * Math.PI)
        .mul(10 + Math.random() * 20),
      r: 20,
      hit: false,
    },
  ])
}
