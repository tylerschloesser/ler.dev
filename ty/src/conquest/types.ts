import { Vec2 } from '../common/vec2'

export type Color = 'red' | 'white' | 'blue' | 'green' | 'orange'

export interface Flag {
  p: Vec2
  r: number
  color: Color
}

export interface Ball {
  p: Vec2
  v: Vec2
  r: number
  color: Color
}

export interface World {
  size: Vec2
  flags: Flag[]
}

export type Pointer = Vec2 | null

export interface Camera {
  p: Vec2
  zoom: number
}

export interface State {
  pointer: Pointer
  world: World
  camera: Camera
  ball: Ball
}
