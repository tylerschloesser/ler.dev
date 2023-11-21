import invariant from 'tiny-invariant'
import { Gear } from '../types.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderGear(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { main } = gpu.programs

  const buffer = gpu.buffers.gears[gear.radius]
  invariant(buffer)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.circle.vertex)
  gl.vertexAttribPointer(
    main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(main.attributes.vertex)

  updateModel(gpu.matrices, gear)

  const { model } = gpu.matrices
  gl.uniformMatrix4fv(main.uniforms.model, false, model)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.circle.count)
}
