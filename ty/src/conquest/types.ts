import Color from 'color'
import { Vec2 } from '../common/vec2'

export interface Flag {
  p: Vec2
  r: number
  color: Color
  progress: number
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

export type Drag = null | {
  a: Vec2
  b: Vec2 | null
}

export interface Camera {
  p: Vec2
  zoom: number
}

export interface State {
  pointer: Pointer
  drag: Drag
  world: World
  camera: Camera
  ball: Ball

  closestFlagInfo: null | {
    index: number
    modifier: Vec2
  }
}
