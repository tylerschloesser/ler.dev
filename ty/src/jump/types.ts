import { Viewport } from '../common/engine'
import { Vec2 } from '../common/vec2'

export interface Ball {
  p: Vec2
  v: Vec2
  r: number
}

export interface Target {
  p: Vec2
  r: number
}

export interface Drag {
  a: Vec2
  b: Vec2 | null
}

export interface Camera {
  p: Vec2
  v: Vec2
}

export interface State {
  pointer: Vec2 | null
  drag: Drag | null
  ball: Ball | null
  viewport: Viewport
  targets: Target[]
  camera: Camera
}
