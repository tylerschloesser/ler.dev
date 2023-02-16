import Color from 'color'
import { Vec2 } from 'three'

export interface Circle {
  type: 'circle'
  method: 'fill' | 'stroke'
  p: Vec2
  r: number
  color: Color
}

export interface Rectangle {
  type: 'rectangle'
  method: 'fill' | 'stroke'
  p: Vec2
  s: Vec2
  color: Color
}

export interface Line {
  type: 'line'
  a: Vec2
  b: Vec2
  color: Color
}

export type RenderObject = Circle | Rectangle | Line
