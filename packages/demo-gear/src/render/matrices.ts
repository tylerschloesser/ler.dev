import { mat4, vec3 } from 'gl-matrix'
import { TEETH, TWO_PI } from '../const.js'
import { IAppContext, Gear, PartialGear } from '../types.js'
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

export function updateChainArcModel(
  matrices: GpuState['matrices'],
  gear: PartialGear,
  zoom: number,
  angle: number,
  s1: number,
): void {
  const { model } = matrices
  mat4.identity(model)

  // v3[0] = gear.radius
  // v3[1] = gear.radius
  // v3[2] = 0
  // mat4.scale(model, model, v3)
  //

  v3[0] = gear.position.x
  v3[1] = gear.position.y
  v3[2] = 0
  mat4.translate(model, model, v3)

  const teeth = gear.radius * TEETH

  mat4.rotateZ(
    model,
    model,
    angle + (TWO_PI * (1 / teeth)) / 2,
  )

  const dy =
    gear.radius * Math.cos((TWO_PI * (1 / teeth)) / 2)

  v3[0] = 0
  v3[1] = -dy
  v3[2] = 0
  mat4.translate(model, model, v3)

  const size = getSize(zoom)
  const sx = s1
  const sy = 0.05 * size

  v3[0] = sx / 2
  v3[1] = sy / 2
  v3[2] = 1
  mat4.scale(model, model, v3)
}

export function updateChainStraightModel(
  matrices: GpuState['matrices'],
  gear: PartialGear,
  zoom: number,
  angle: number,
  s1: number,
  dx: number,
): void {
  const { model } = matrices
  mat4.identity(model)

  v3[0] = gear.position.x
  v3[1] = gear.position.y
  v3[2] = 0
  mat4.translate(model, model, v3)

  mat4.rotateZ(model, model, angle)

  const teeth = gear.radius * TEETH
  const dy =
    gear.radius * Math.cos((TWO_PI * (1 / teeth)) / 2)

  const size = getSize(zoom)
  const sx = s1
  const sy = 0.05 * size

  v3[0] = dx
  v3[1] = -dy
  v3[2] = 0
  mat4.translate(model, model, v3)

  v3[0] = sx / 2
  v3[1] = sy / 2
  v3[2] = 1
  mat4.scale(model, model, v3)
}

export function updateGearBodyModel(
  matrices: GpuState['matrices'],
  gear: PartialGear,
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

  mat4.rotateZ(model, model, gear.angle)
}

export function updateGearToothModel(
  matrices: GpuState['matrices'],
  gear: PartialGear,
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

  const size = getSize(zoom)
  const sx = 0.05 * size
  const sy = 0.12 * size

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
  context: IAppContext,
): void {
  const { view } = matrices

  mat4.identity(view)

  v3[0] = context.viewport.size.x / 2
  v3[1] = context.viewport.size.y / 2
  v3[2] = 0
  mat4.translate(view, view, v3)

  v3[0] = context.tileSize
  v3[1] = context.tileSize
  v3[2] = 0
  mat4.scale(view, view, v3)

  v3[0] = -context.camera.position.x
  v3[1] = -context.camera.position.y
  v3[2] = 0
  mat4.translate(view, view, v3)
}

export function updateProjection(
  matrices: GpuState['matrices'],
  context: IAppContext,
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

  v3[0] = 1 / context.viewport.size.x
  v3[1] = 1 / context.viewport.size.y
  v3[2] = 0
  mat4.scale(projection, projection, v3)
}

function getSize(zoom: number): number {
  return 4 - zoom * 3
}
