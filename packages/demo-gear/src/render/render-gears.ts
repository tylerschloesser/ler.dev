import invariant from 'tiny-invariant'
import { TEETH, TWO_PI } from '../const.js'
import {
  AppState,
  GearBehaviorType,
  PartialGear,
} from '../types.js'
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
    let color: 'blue' | 'orange' | 'pink' = 'blue'
    switch (gear.behavior?.type) {
      case GearBehaviorType.enum.Friction:
        color = 'orange'
        break
      case GearBehaviorType.enum.Force:
        color = 'pink'
        break
    }
    renderGear(gear, gl, gpu, state.camera.zoom, color)
  }
}

export function renderGear(
  gear: PartialGear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  zoom: number,
  color: 'pink' | 'orange' | 'blue' | 'red' | 'green',
): void {
  renderGearBody(gear, gl, gpu, color)
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
  color: 'pink' | 'orange' | 'blue' | 'red' | 'green',
): void {
  const { gearBody } = gpu.programs
  gl.useProgram(gearBody.program)

  updateGearBodyModel(gpu.matrices, gear)
  gl.uniformMatrix4fv(
    gearBody.uniforms.model,
    false,
    gpu.matrices.model,
  )

  switch (color) {
    case 'pink': {
      // prettier-ignore
      gl.uniform4f(gearBody.uniforms.color, 1.0, 0.0, 1.0, 1.0)
      break
    }
    case 'orange': {
      // prettier-ignore
      gl.uniform4f(gearBody.uniforms.color, 1.0, 0.647, 0.0, 1.0)
      break
    }
    case 'blue': {
      // prettier-ignore
      gl.uniform4f(gearBody.uniforms.color, 0.0, 0.0, 1.0, 1.0)
      break
    }
    case 'red': {
      // prettier-ignore
      gl.uniform4f(gearBody.uniforms.color, 1.0, 0.0, 0.0, 0.5)
      break
    }
    case 'green': {
      // prettier-ignore
      gl.uniform4f(gearBody.uniforms.color, 0.0, 1.0, 0.0, 0.5)
      break
    }
    default: {
      invariant(false)
    }
  }

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
