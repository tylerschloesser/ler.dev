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
    w: 1000,
    h: 1000,
  },
  ball: {
    p: new Vec2(500, 500),
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

export function minScale() {
  let padding = Math.min(state.world.w, state.world.h) * 0.1
  return Math.min(
    viewport.w / (state.world.w + padding),
    viewport.h / (state.world.h + padding),
  )
}

export let scale = minScale()

export function adjustScale(dy: number) {
  scale = Math.max(minScale(), scale + dy * 0.001)
}
