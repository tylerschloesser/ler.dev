import { AppState } from '../types.js'
import { GpuState } from './types.js'

export function renderResources(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { fillRect } = gpu.programs
  gl.useProgram(fillRect.program)
}
