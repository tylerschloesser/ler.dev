import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { IAppContext } from '../types.js'
import { mod } from '../util.js'
import { Color, rgb } from './color.js'
import { GpuState } from './types.js'

const transform: mat4 = mat4.create()
const v3: vec3 = vec3.create()

export function renderGrid(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  renderPartialGrid(
    context,
    gl,
    gpu,
    rgb(0.25 * context.camera.zoom * 255),
    2,
  )
}

export function renderPartialGrid(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  color: Color,
  step: number,
): void {
  // step must be a power of 2
  invariant(Math.log2(step) % 1 === 0)

  const { fillInstanced } = gpu.programs

  gl.useProgram(fillInstanced.program)

  gl.uniform4f(
    fillInstanced.uniforms.color,
    color.r,
    color.g,
    color.b,
    color.a,
  )

  mat4.identity(transform)
  // flip the y axis so it matches canvas/dom
  mat4Scale(transform, 1, -1)
  mat4Translate(transform, -1)
  mat4Scale(transform, 2)
  mat4Scale(
    transform,
    1 / context.viewport.size.x,
    1 / context.viewport.size.y,
  )
  mat4Translate(transform, -0.5, -0.5)

  const tileSize = context.tileSize

  // prettier-ignore
  mat4Translate(
    transform,
    (mod(context.viewport.size.x / 2 / tileSize - context.camera.position.x, step) - step) * tileSize,
    (mod(context.viewport.size.y / 2 / tileSize - context.camera.position.y, step) - step) * tileSize,
  )

  gl.uniformMatrix4fv(
    fillInstanced.uniforms.transform,
    false,
    transform,
  )

  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffers.fillRect)
  gl.vertexAttribPointer(
    fillInstanced.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(
    fillInstanced.attributes.vertex,
  )

  const matrices = gpu.buffers.fillInstancedMatrices

  const cols =
    Math.ceil(context.viewport.size.x / tileSize / step) + 1
  const rows =
    Math.ceil(context.viewport.size.y / tileSize / step) + 1

  invariant(cols + rows <= matrices.values.length)

  let mi = 0
  for (let col = 0; col < cols; col++) {
    const matrix = matrices.values.at(mi++)
    invariant(matrix)

    mat4.identity(matrix)
    mat4Translate(matrix, col * tileSize * step, 0)
    mat4Scale(matrix, 2, rows * tileSize * step)
  }
  for (let row = 0; row < rows; row++) {
    const matrix = matrices.values.at(mi++)
    invariant(matrix)

    mat4.identity(matrix)
    mat4Translate(matrix, 0, row * tileSize * step)
    mat4Scale(matrix, cols * tileSize * step, 2)
  }

  invariant(mi === cols + rows)

  gl.bindBuffer(gl.ARRAY_BUFFER, matrices.buffer)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrices.data)

  for (let i = 0; i < 4; i++) {
    const index = fillInstanced.attributes.matrix + i
    gl.enableVertexAttribArray(index)

    const offset = i * 16
    gl.vertexAttribPointer(
      index,
      4,
      gl.FLOAT,
      false,
      4 * 16, // bytes per matrix
      offset,
    )

    gl.vertexAttribDivisor(index, 1)
  }

  gl.drawArraysInstanced(
    gl.TRIANGLE_STRIP,
    0,
    4,
    cols + rows,
  )
}

function mat4Scale(matrix: mat4, xy: number): void
function mat4Scale(matrix: mat4, x: number, y: number): void
function mat4Scale(
  matrix: mat4,
  x: number,
  y: number,
  z: number,
): void
function mat4Scale(
  matrix: mat4,
  x: number,
  y?: number,
  z?: number,
): void {
  v3[0] = x
  v3[1] = y ?? x
  v3[2] = z ?? 0
  mat4.scale(matrix, matrix, v3)
}

function mat4Translate(matrix: mat4, xy: number): void
function mat4Translate(
  matrix: mat4,
  x: number,
  y: number,
): void
function mat4Translate(
  matrix: mat4,
  x: number,
  y: number,
  z: number,
): void
function mat4Translate(
  matrix: mat4,
  x: number,
  y?: number,
  z?: number,
): void {
  v3[0] = x
  v3[1] = y ?? x
  v3[2] = z ?? 1
  mat4.translate(matrix, matrix, v3)
}
