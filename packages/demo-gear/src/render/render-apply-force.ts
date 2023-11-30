import { ApplyForceHand, AppState } from '../types.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderApplyForce(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  hand: ApplyForceHand,
) {
  if (!hand.gear) {
    return
  }

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

  gl.uniform4f(outlineRect.uniforms.color, 1, 1, 1, 1)
  gl.uniform1f(outlineRect.uniforms.size, size)

  updateModel(gpu.matrices, hand.gear)
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
