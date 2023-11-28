import {
  AppState,
  BuildHand,
  PartialGear,
} from '../types.js'
import { renderChain } from './render-chain.js'
import { renderGear } from './render-gears.js'
import { GpuState } from './types.js'

const partial: PartialGear = {
  angle: 0,
  position: {
    x: 0,
    y: 0,
  },
  radius: 0,
  connections: [],
  velocity: 0,
}

export function renderBuild(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  build: BuildHand,
) {
  if (!build.position) {
    return
  }

  partial.position.x = build.position.x
  partial.position.y = build.position.y
  partial.radius = build.radius
  partial.angle = build.angle

  renderGear(
    partial,
    gl,
    gpu,
    state.camera.zoom,
    build.valid ? 'green' : 'red',
  )

  if (build.chain && build.valid) {
    renderChain(
      partial,
      build.chain,
      gl,
      gpu,
      state.camera.zoom,
    )
  }
}
