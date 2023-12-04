import { mat4, vec3 } from 'gl-matrix'
import { IAppContext, Gear } from '../types.js'
import { Color } from './color.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderGearOutline(
  state: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  gear: Gear,
  color: Color,
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

  const size = 0.1 + (1 - state.camera.zoom) * 0.2

  gl.uniform4f(
    outlineRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )
  gl.uniform1f(outlineRect.uniforms.size, size)

  updateModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    outlineRect.uniforms.model,
    false,
    gpu.matrices.model,
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

const tileModel = mat4.create()
const v3 = vec3.create()

export function renderTileOutline(
  state: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  color: Color,
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

  const size = 0.1 + (1 - state.camera.zoom) * 0.2

  gl.uniform4f(
    outlineRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )
  gl.uniform1f(outlineRect.uniforms.size, size)

  mat4.identity(tileModel)

  // the model is -1 to 1 because it's easier to scale
  // to the radius for gears...
  // so we need to offset and scale by .5
  //
  // TODO clean this up for real...
  //

  v3[0] = Math.floor(state.camera.position.x) + 0.5
  v3[1] = Math.floor(state.camera.position.y) + 0.5
  v3[2] = 0
  mat4.translate(tileModel, tileModel, v3)

  v3[0] = 0.5
  v3[1] = 0.5
  v3[2] = 0
  mat4.scale(tileModel, tileModel, v3)

  gl.uniformMatrix4fv(
    outlineRect.uniforms.model,
    false,
    tileModel,
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
