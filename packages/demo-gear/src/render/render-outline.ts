import { mat4, vec3 } from 'gl-matrix'
import { GearEntity, IAppContext } from '../types.js'
import { Color } from './color.js'
import { GpuState } from './types.js'

const model = mat4.create()
const v = vec3.create()

export function renderOutline(
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  color: Color,
  x: number,
  y: number,
  w: number,
  h: number,
  lineWidth: number,
) {
  const { outlineRect } = gpu.programs
  gl.useProgram(outlineRect.program)

  const { view, projection } = gpu.matrices
  gl.uniformMatrix4fv(
    outlineRect.uniforms.view,
    false,
    view,
  )
  gl.uniformMatrix4fv(
    outlineRect.uniforms.projection,
    false,
    projection,
  )

  gl.uniform4f(
    outlineRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )
  gl.uniform1f(outlineRect.uniforms.size, lineWidth)

  mat4.identity(model)
  v[0] = x
  v[1] = y
  v[2] = 0
  mat4.translate(model, model, v)
  v[0] = w
  v[1] = h
  v[2] = 0
  mat4.scale(model, model, v)
  gl.uniformMatrix4fv(
    outlineRect.uniforms.model,
    false,
    model,
  )

  const buffer = gpu.buffers.outlineRect
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(
    outlineRect.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(outlineRect.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10)
}

export function renderGearOutline(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  gear: GearEntity,
  color: Color,
) {
  const lineWidth = 0.1 + (1 - context.camera.zoom) * 0.2

  renderOutline(
    gl,
    gpu,
    color,
    gear.center.x - gear.radius,
    gear.center.y - gear.radius,
    gear.radius * 2,
    gear.radius * 2,
    lineWidth,
  )
}

export function renderTileOutline(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  color: Color,
  x: number,
  y: number,
) {
  const lineWidth = 0.1 + (1 - context.camera.zoom) * 0.2
  renderOutline(gl, gpu, color, x, y, 1, 1, lineWidth)
}
