import { Gear } from '../types.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderGear(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { main } = gpu.programs
  updateModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    main.uniforms.model,
    false,
    gpu.matrices.model,
  )

  gl.uniform4f(main.uniforms.color, 0.0, 1.0, 0.0, 1.0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffers.square)
  gl.vertexAttribPointer(
    main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(main.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
