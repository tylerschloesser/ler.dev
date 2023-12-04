import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { AppState } from '../types.js'
import { FUEL_COLOR } from './color.js'
import { GpuState } from './types.js'

const model = mat4.create()
const v3 = vec3.create()

export function renderResources(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { fillRect } = gpu.programs
  gl.useProgram(fillRect.program)

  const { view, projection } = gpu.matrices
  gl.uniformMatrix4fv(fillRect.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    fillRect.uniforms.projection,
    false,
    projection,
  )

  const color = FUEL_COLOR
  gl.uniform4f(
    fillRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )

  for (const [tileId, tile] of Object.entries(
    state.world.tiles,
  )) {
    if (!tile.resourceType) {
      continue
    }
    const position = tileId
      .split('.')
      .map((v) => parseInt(v))
    const [x, y] = position
    invariant(typeof x === 'number')
    invariant(typeof y === 'number')

    mat4.identity(model)

    // the model is -1 to 1 because it's easier to scale
    // to the radius for gears...
    // so we need to offset and scale by .5
    //
    // TODO clean this up for real...
    //

    v3[0] = x + 0.5
    v3[1] = y + 0.5
    v3[2] = 0
    mat4.translate(model, model, v3)

    v3[0] = 0.5
    v3[1] = 0.5
    v3[2] = 0
    mat4.scale(model, model, v3)

    gl.uniformMatrix4fv(
      fillRect.uniforms.model,
      false,
      model,
    )

    const buffer = gpu.buffers.square
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(
      fillRect.attributes.vertex,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
    gl.enableVertexAttribArray(fillRect.attributes.vertex)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
