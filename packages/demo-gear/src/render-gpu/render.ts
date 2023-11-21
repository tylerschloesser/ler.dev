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
}
