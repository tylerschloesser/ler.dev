import { AppState } from '../types.js'
import { GpuState } from './state.js'

export function render(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  gl.useProgram(gpu.programs.main.program)

  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffers.square)
  gl.vertexAttribPointer(
    gpu.programs.main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(
    gpu.programs.main.attributes.vertex,
  )

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
