import {
  AppState,
  ConnectionType,
  HandType,
} from '../types.js'
import { iterateConnections } from '../util.js'
import { updateProjection, updateView } from './matrices.js'
import { renderChain } from './render-chain.js'
import { renderGears } from './render-gear.js'
import { renderGrid } from './render-grid.js'
import { GpuState } from './types.js'

export function render(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  updateView(gpu.matrices, state)
  updateProjection(gpu.matrices, state)

  renderGrid(state, gl, gpu)
  renderGears(state, gl, gpu)

  for (const { gear1, gear2, type } of iterateConnections(
    state.world.gears,
  )) {
    if (type === ConnectionType.enum.Chain) {
      renderChain(gear1, gear2, gl, gpu, state.camera.zoom)
    }
  }

  switch (state.hand?.type) {
    case HandType.Build: {
    }
  }
}
