import {
  AppState,
  BuildHand,
  PartialGear,
} from '../types.js'
import { renderGear } from './render-gears.js'
import { GpuState } from './types.js'

const partial: PartialGear = {
  angle: 0,
  position: {
    x: 0,
    y: 0,
  },
  radius: 0,
}

export function renderBuld(
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

  renderGear(
    partial,
    gl,
    gpu,
    state.camera.zoom,
    build.valid ? 'green' : 'red',
  )
}
