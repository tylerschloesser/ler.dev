import invariant from 'tiny-invariant'

export interface Color {
  r: number
  g: number
  b: number
  a: number
}

export const GEAR_BLUE: Color = {
  r: 0,
  g: 0,
  b: 1,
  a: 1,
}

export const GEAR_ORANGE: Color = {
  r: 1,
  g: 0.647,
  b: 0,
  a: 1,
}

export const GEAR_PINK: Color = {
  r: 1,
  g: 0,
  b: 1,
  a: 1,
}

export const BUILD_GEAR_VALID: Color = {
  r: 0,
  g: 1,
  b: 0,
  a: 0.5,
}

export const BUILD_GEAR_INVALID: Color = {
  r: 1,
  g: 0,
  b: 0,
  a: 0.5,
}

export const TILE_OUTLINE: Color = {
  r: 1,
  g: 1,
  b: 1,
  a: 0.5,
}

export const GEAR_OUTLINE: Color = TILE_OUTLINE

export const ADD_RESOURCE_VALID: Color = BUILD_GEAR_VALID
export const ADD_RESOURCE_INVALID: Color =
  BUILD_GEAR_INVALID

export const ADD_BELT_VALID: Color = BUILD_GEAR_VALID
export const ADD_BELT_INVALID: Color = BUILD_GEAR_INVALID

export const FUEL_COLOR: Color = rgb(255, 255, 51)
export const ITEM_BORDER: Color = rgb(0)
export const BELT_COLOR: Color = rgb(128)

export const BELT_LINE_COLOR: Color = rgb(64)
export const TURN_BELT_LINE_COLOR: Color = rgb(64 + 32)

export const INTERSECTION_BELT_COLOR = rgb(32)

export const DELETE: Color = rgba(255, 0, 0, 0.5)

export function rgb(r: number, g: number, b: number): Color
export function rgb(r: number): Color
export function rgb(
  r: number,
  g?: number,
  b?: number,
): Color {
  return rgba(r, g ?? r, b ?? r, 1)
}

export function rgba(
  r: number,
  g: number,
  b: number,
  a: number,
): Color
export function rgba(rgb: number, a: number): Color
export function rgba(
  r: number,
  g: number,
  b?: number,
  a?: number,
): Color {
  if (b === undefined) {
    invariant(a === undefined)
    return {
      r: r / 255,
      g: r / 255,
      b: r / 255,
      a: g,
    }
  }
  invariant(a !== undefined)
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a,
  }
}

export const BACKGROUND = rgb(255, 0, 0)

export const CLEAR = rgb(0)

export const TRANSPARENT = rgba(0, 0)
