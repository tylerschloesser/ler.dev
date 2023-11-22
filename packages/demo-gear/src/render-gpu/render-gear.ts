import invariant from 'tiny-invariant'
import { Gear } from '../types.js'
import { updateModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderGear(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  renderGearBody(gear, gl, gpu)
  renderGearTeeth(gear, gl, gpu)
}

export function renderGearTeeth(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { gearTeeth } = gpu.programs
  gl.useProgram(gearTeeth.program)

  gl.uniform4f(gearTeeth.uniforms.color, 1.0, 0.0, 0.0, 1.0)

  updateModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    gearTeeth.uniforms.model,
    false,
    gpu.matrices.model,
  )

  const buffer = gpu.buffers.gearTooth
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(
    gearTeeth.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(gearTeeth.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

export function renderGearBody(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { gearBody } = gpu.programs
  gl.useProgram(gearBody.program)

  updateModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    gearBody.uniforms.model,
    false,
    gpu.matrices.model,
  )

  gl.uniform4f(gearBody.uniforms.color, 0.0, 1.0, 0.0, 1.0)

  const buffer = gpu.buffers.gearBody[gear.radius]
  invariant(buffer)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex)
  gl.vertexAttribPointer(
    gearBody.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(gearBody.attributes.vertex)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.count)
}