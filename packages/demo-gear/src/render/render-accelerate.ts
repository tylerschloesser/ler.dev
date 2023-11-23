import { AccelerateHand, AppState } from '../types.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderAccelerate(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  accelerate: AccelerateHand,
) {
  if (!accelerate.gear) {
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

  gl.uniform4f(outlineRect.uniforms.color, 1, 1, 1, 1)

  updateModel(gpu.matrices, accelerate.gear)
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
