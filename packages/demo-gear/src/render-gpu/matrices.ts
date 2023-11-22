import { mat4, vec3 } from 'gl-matrix'
import { AppState, Gear } from '../types.js'
import { GpuState } from './types.js'

export function initMatrices(): GpuState['matrices'] {
  const model = mat4.create()
  const view = mat4.create()
  const projection = mat4.create()

  return { model, view, projection }
}

const v3: vec3 = vec3.create()

export function updateModel(
  matrices: GpuState['matrices'],
  gear: Gear,
): void {
  const { model } = matrices
  mat4.identity(model)

  v3[0] = gear.position.x
  v3[1] = gear.position.y
  v3[2] = 0
  mat4.translate(model, model, v3)

  v3[0] = gear.radius
  v3[1] = gear.radius
  v3[2] = 0
  mat4.scale(model, model, v3)
}

export function updateToothModel(
  matrices: GpuState['matrices'],
  gear: Gear,
  angle: number,
  zoom: number,
): void {
  const { model } = matrices
  mat4.identity(model)

  v3[0] = gear.position.x
  v3[1] = gear.position.y
  v3[2] = 0
  mat4.translate(model, model, v3)

  mat4.rotateZ(model, model, angle)

  const size = 2 - zoom

  const sx = (3 / 64) * size
  const sy = (11 / 64) * size

  v3[0] = 0
  v3[1] = (gear.radius - sy) * -1
  v3[2] = 0
  mat4.translate(model, model, v3)

  v3[0] = sx
  v3[1] = sy
  v3[2] = 1
  mat4.scale(model, model, v3)

  // v3[0] = gear.radius
  // v3[1] = gear.radius
  // v3[2] = 0
  // mat4.scale(model, model, v3)
}

export function updateView(
  matrices: GpuState['matrices'],
  state: AppState,
): void {
  const { view } = matrices

  mat4.identity(view)

  v3[0] = state.viewport.size.x / 2
  v3[1] = state.viewport.size.y / 2
  v3[2] = 0
  mat4.translate(view, view, v3)

  v3[0] = state.tileSize
  v3[1] = state.tileSize
  v3[2] = 0
  mat4.scale(view, view, v3)

  v3[0] = -state.camera.position.x
  v3[1] = -state.camera.position.y
  v3[2] = 0
  mat4.translate(view, view, v3)
}

export function updateProjection(
  matrices: GpuState['matrices'],
  state: AppState,
): void {
  const { projection } = matrices

  mat4.identity(projection)

  v3[0] = 1
  v3[1] = -1 // flip the y axis so it matches canvas/dom
  v3[2] = 0
  mat4.scale(projection, projection, v3)

  v3[0] = -1
  v3[1] = -1
  v3[2] = 0
  mat4.translate(projection, projection, v3)

  v3[0] = 2
  v3[1] = 2
  v3[2] = 0
  mat4.scale(projection, projection, v3)

  v3[0] = 1 / state.viewport.size.x
  v3[1] = 1 / state.viewport.size.y
  v3[2] = 0
  mat4.scale(projection, projection, v3)
}
