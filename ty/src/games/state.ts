import { Vec2 } from './vec2'

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
  r: number
  hit: boolean
}

export interface State {
  ball: Ball
  drag?: Drag
  world: World
  targets: Target[]
}

export const state: State = {
  world: {
    w: 10_000,
    h: 10_000,
  },
  ball: {
    p: new Vec2(5_000, 5_000),
    v: new Vec2(0, 0),
    r: 20,
  },
  targets: [],
}

export interface Viewport {
  w: number
  h: number
}

export let viewport: Viewport = {
  w: window.innerWidth,
  h: window.innerHeight,
}

export function updateViewport(next: Viewport) {
  viewport = next
}

export let scale = 1

export function adjustScale(dy: number) {
  scale += dy * 0.001
  scale = Math.max(scale, 0.2)
}

export function addTarget(targets: Target[]) {
  let p: Vec2
  const padding = Math.min(state.world.w, state.world.h) * 0.1
  while (true) {
    p = new Vec2(Math.random() * state.world.w, Math.random() * state.world.h)
    if (
      p.x < padding ||
      state.world.w - p.x < padding ||
      p.y < padding ||
      state.world.h - p.y < padding
    ) {
      continue
    }

    // ensure it's not too close to other targets
    if (
      targets.some((other) => {
        return other.p.sub(p).length() < padding
      })
    ) {
      continue
    }

    const dist = state.ball.p.sub(p).length()
    if (dist > padding) {
      break
    }
  }

  targets.push({ p, r: 20, hit: false })
}
