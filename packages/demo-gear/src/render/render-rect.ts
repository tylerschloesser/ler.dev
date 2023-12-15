import { mat4, vec3 } from 'gl-matrix'
import { Rotation } from '../types.js'
import { toRadians } from '../util.js'
import { Color } from './color.js'
import { GpuState } from './types.js'

const model = mat4.create()
const v = vec3.create()

export function batchRenderRect(
  gl: WebGL2RenderingContext,
  gpu: GpuState,
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

  return (
    x: number,
    y: number,
    w: number,
    h: number,
    color: Color,
    z: number = 0,
    rotation: Rotation = 0,
  ) => {
    gl.uniform4f(
      fillRect.uniforms.color,
      color.r,
      color.g,
      color.b,
      color.a,
    )

    mat4.identity(model)

    v[0] = x
    v[1] = y
    v[2] = z
    mat4.translate(model, model, v)

    // TODO this assumes that the "container" square is 1x1
    {
      v[0] = 0.5
      v[1] = 0.5
      v[2] = 0
      mat4.translate(model, model, v)
      mat4.rotateZ(model, model, toRadians(rotation))
      v[0] = -0.5
      v[1] = -0.5
      v[2] = 0
      mat4.translate(model, model, v)
    }

    v[0] = w
    v[1] = h
    v[2] = 1
    mat4.scale(model, model, v)

    gl.uniformMatrix4fv(
      fillRect.uniforms.model,
      false,
      model,
    )

    const buffer = gpu.buffers.fillRect
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

export function renderRect(
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Color,
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

  gl.uniform4f(
    fillRect.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )

  mat4.identity(model)

  v[0] = x
  v[1] = y
  v[2] = 0
  mat4.translate(model, model, v)

  v[0] = w
  v[1] = h
  v[2] = 0
  mat4.scale(model, model, v)

  gl.uniformMatrix4fv(fillRect.uniforms.model, false, model)

  const buffer = gpu.buffers.fillRect
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
