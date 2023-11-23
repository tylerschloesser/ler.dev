import { Gear } from '../types.js'
import { GpuState } from './types.js'

export function renderChain(
  gear1: Gear,
  gear2: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { chain } = gpu.programs
  gl.useProgram(chain.program)

  const { view, projection } = gpu.matrices

  gl.uniformMatrix4fv(chain.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    chain.uniforms.projection,
    false,
    projection,
  )
}
