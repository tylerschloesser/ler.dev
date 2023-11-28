import { AppState, BuildHand } from '../types.js'
import { renderChain } from './render-chain.js'
import { renderGear } from './render-gears.js'
import { GpuState } from './types.js'

export function renderBuild(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  build: BuildHand,
) {
  if (!build.gear) {
    return
  }
  renderGear(
    build.gear,
    gl,
    gpu,
    state.camera.zoom,
    build.valid ? 'green' : 'red',
  )

  if (build.chain && build.valid) {
    renderChain(
      build.gear,
      build.chain,
      gl,
      gpu,
      state.camera.zoom,
    )
  }
}
