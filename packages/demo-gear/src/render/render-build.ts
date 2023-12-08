import { tempGetGear } from '../temp.js'
import { IAppContext, BuildHand } from '../types.js'
import {
  BUILD_GEAR_INVALID,
  BUILD_GEAR_VALID,
} from './color.js'
import { renderChain } from './render-chain.js'
import { renderGear } from './render-gears.js'
import { GpuState } from './types.js'

export function renderBuild(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  build: BuildHand,
) {
  const buildGear = tempGetGear(build)
  renderGear(
    buildGear,
    gl,
    gpu,
    context.camera.zoom,
    build.valid ? BUILD_GEAR_VALID : BUILD_GEAR_INVALID,
  )

  if (build.chain && build.valid) {
    renderChain(
      buildGear,
      build.chain,
      gl,
      gpu,
      context.camera.zoom,
    )
  }
}
