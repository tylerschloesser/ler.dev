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
  updateModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    main.uniforms.model,
    false,
    gpu.matrices.model,
  )

  renderGearCircle(gear, gl, gpu)
  renderGearTeeth(gear, gl, gpu)
}

function renderGearCircle(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  const { main } = gpu.programs

  gl.uniform4f(main.uniforms.color, 0.0, 1.0, 0.0, 1.0)

  const buffer = gpu.buffers.gears[gear.radius]?.circle
  invariant(buffer)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex)
  gl.vertexAttribPointer(
    main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(main.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.count)
}

function renderGearTeeth(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  const { main } = gpu.programs

  gl.uniform4f(main.uniforms.color, 1.0, 0.0, 0.0, 1.0)

  const buffer = gpu.buffers.gears[gear.radius]?.teeth
  invariant(buffer)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex)
  gl.vertexAttribPointer(
    main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(main.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.count)
}
