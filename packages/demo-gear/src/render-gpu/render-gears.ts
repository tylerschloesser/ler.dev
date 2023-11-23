import invariant from 'tiny-invariant'
import { TEETH, TWO_PI } from '../const.js'
import { AppState, PartialGear } from '../types.js'
import {
  updateGearBodyModel,
  updateGearToothModel,
} from './matrices.js'
import { GpuState } from './types.js'

export function renderGears(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  const { view, projection } = gpu.matrices
  const { gearBody, gearTeeth } = gpu.programs

  gl.useProgram(gearBody.program)
  gl.uniformMatrix4fv(gearBody.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    gearBody.uniforms.projection,
    false,
    projection,
  )

  gl.useProgram(gearTeeth.program)
  gl.uniformMatrix4fv(gearTeeth.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    gearTeeth.uniforms.projection,
    false,
    projection,
  )
  gl.uniform1f(gearTeeth.uniforms.tileSize, state.tileSize)

  for (const gear of Object.values(state.world.gears)) {
    renderGear(gear, gl, gpu, state.camera.zoom)
  }
}

export function renderGear(
  gear: PartialGear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  zoom: number,
): void {
  renderGearBody(gear, gl, gpu)
  renderGearTeeth(gear, gl, gpu, zoom)
}

function renderGearTeeth(
  gear: PartialGear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  zoom: number,
): void {
  const { gearTeeth } = gpu.programs
  gl.useProgram(gearTeeth.program)

  gl.uniform4f(gearTeeth.uniforms.color, 1.0, 1.0, 1.0, 1.0)

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

  const teeth = gear.radius * TEETH
  for (let i = 0; i < teeth; i++) {
    const angle = TWO_PI * (i / teeth) + gear.angle
    updateGearToothModel(gpu.matrices, gear, angle, zoom)
    gl.uniformMatrix4fv(
      gearTeeth.uniforms.model,
      false,
      gpu.matrices.model,
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

function renderGearBody(
  gear: PartialGear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { gearBody } = gpu.programs
  gl.useProgram(gearBody.program)

  updateGearBodyModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    gearBody.uniforms.model,
    false,
    gpu.matrices.model,
  )

  gl.uniform4f(gearBody.uniforms.color, 0.0, 0.0, 1.0, 1.0)

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