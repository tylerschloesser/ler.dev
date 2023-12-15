import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { Rotation } from '../types.js'
import { mod, toRadians } from '../util.js'
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

    rotation?: Rotation,
    cx?: number,
    cy?: number,
    cw?: number,
    ch?: number,
  ) => {
    if (rotation === undefined) {
    } else {
    }

    gl.uniform4f(
      fillRect.uniforms.color,
      color.r,
      color.g,
      color.b,
      color.a,
    )

    mat4.identity(model)

    if (rotation !== undefined) {
      invariant(typeof cx === 'number')
      invariant(typeof cy === 'number')
      invariant(typeof cw === 'number')
      invariant(typeof ch === 'number')

      v[0] = cx
      v[1] = cy
      v[2] = 0
      mat4.translate(model, model, v)

      v[0] = cw / 2
      v[1] = ch / 2
      v[2] = 0
      mat4.translate(model, model, v)
      mat4.rotateZ(model, model, toRadians(rotation))
      v[0] = -cw / 2
      v[1] = -ch / 2
      v[2] = 0
      mat4.translate(model, model, v)

      v[0] = x
      v[1] = y
      v[2] = z
      mat4.translate(model, model, v)
      v[0] = w * cw
      v[1] = h * ch
      v[2] = 1
      mat4.scale(model, model, v)
    } else {
      invariant(cx === undefined)
      invariant(cy === undefined)
      invariant(cw === undefined)
      invariant(ch === undefined)

      v[0] = x
      v[1] = y
      v[2] = z
      mat4.translate(model, model, v)
      v[0] = w
      v[1] = h
      v[2] = 1
      mat4.scale(model, model, v)
    }

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
