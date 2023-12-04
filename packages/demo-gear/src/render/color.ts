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

export const FUEL_COLOR: Color = {
  r: 1,
  g: 1,
  b: 1,
  a: 1,
}
