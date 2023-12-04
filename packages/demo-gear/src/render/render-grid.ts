import { IAppContext } from '../types.js'
import { GpuState } from './types.js'

export function renderGrid(
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
