import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { IAppContext } from '../types.js'
import { BACKGROUND } from './color.js'
import { GpuState } from './types.js'

const transform: mat4 = mat4.create()
const v3: vec3 = vec3.create()

export function renderGridV2(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { fillInstanced } = gpu.programs

  gl.useProgram(fillInstanced.program)

  gl.uniform4f(
    fillInstanced.uniforms.color,
    BACKGROUND.r,
    BACKGROUND.g,
    BACKGROUND.b,
    BACKGROUND.a,
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

  mat4Scale(transform, 2, context.viewport.size.y)

  // mat4Translate(
  //   transform,
  //   context.viewport.size.x / 2,
  //   context.viewport.size.y / 2,
  // )
  // mat4Scale(transform, context.tileSize)

  // mat4Translate(
  //   transform,
  //   mod(-context.camera.position.x, 1),
  //   mod(-context.camera.position.y, 1),
  // )

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
  const matrix = matrices.values.at(0)
  invariant(matrix)
  mat4.identity(matrix)

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

    // TODO do I need this??
    gl.vertexAttribDivisor(index, 1)
  }

  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
}

export function renderGridV1(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { grid } = gpu.programs

  gl.useProgram(grid.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffers.square)
  gl.vertexAttribPointer(
    grid.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(grid.attributes.vertex)

  gl.uniform2f(
    grid.uniforms.viewport,
    context.viewport.size.x,
    context.viewport.size.y,
  )

  gl.uniform1f(grid.uniforms.tileSize, context.tileSize)

  gl.uniform2f(
    grid.uniforms.camera,
    context.camera.position.x,
    context.camera.position.y,
  )

  gl.uniform1f(grid.uniforms.zoom, context.camera.zoom)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
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
