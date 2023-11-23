import { Gear } from '../types.js'
import { updateChainModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderChain(
  gear1: Gear,
  gear2: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { chain } = gpu.programs
  gl.useProgram(chain.program)

  const { view, projection } = gpu.matrices

  updateChainModel(gpu.matrices, gear1)
  gl.uniformMatrix4fv(chain.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    chain.uniforms.projection,
    false,
    projection,
  )
  gl.uniformMatrix4fv(
    chain.uniforms.model,
    false,
    gpu.matrices.model,
  )

  gl.uniform4f(chain.uniforms.color, 1.0, 0.0, 0.0, 1.0)

  const buffer = gpu.buffers.square
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(
    chain.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(chain.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
