import { mat4, vec3 } from 'gl-matrix'
import { Belt, IAppContext } from '../types.js'
import { Color } from './color.js'
import { GpuState } from './types.js'

const model = mat4.create()
const v3 = vec3.create()

export function renderBelt(
  _context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  path: Belt['path'],
  color: Color,
) {
  const { fillRect } = gpu.programs
  gl.useProgram(fillRect.program)

  const { view, projection } = gpu.matrices
  gl.uniformMatrix4fv(fillRect.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    fillRect.uniforms.projection,
    false,
    projection,
  )

  gl.uniform4f(
    fillRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )

  for (const { x, y } of path) {
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