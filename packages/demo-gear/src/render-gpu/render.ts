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

  const { pixelRatio } = state.viewport
  gl.uniform2f(
    gpu.programs.main.uniforms.viewport,
    state.viewport.size.x * pixelRatio,
    state.viewport.size.y * pixelRatio,
  )

  gl.uniform1f(
    gpu.programs.main.uniforms.tileSize,
    state.tileSize,
  )

  gl.uniform2f(
    gpu.programs.main.uniforms.camera,
    state.camera.position.x,
    state.camera.position.y,
  )

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
