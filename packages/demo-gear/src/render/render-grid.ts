import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { IAppContext } from '../types.js'
import { BACKGROUND } from './color.js'
import { GpuState } from './types.js'

// const matrix: mat4 = mat4.create()
// const v: vec3 = vec3.create()

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
  // gl.vertexAttribDivisor(fillInstanced.attributes.vertex, 0)

  const matrices = gpu.buffers.fillInstancedMatrices
  const matrix = matrices.values.at(0)
  invariant(matrix)
  mat4.identity(matrix)

  for (let i = 0; i < 16; i++) {
    // console.log(matrices.data[i], matrix[i])
  }

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
