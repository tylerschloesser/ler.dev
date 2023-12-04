import {
  AppState,
  ConnectionType,
  HandType,
} from '../types.js'
import { iterateConnections } from '../util.js'
import {
  ADD_RESOURCE_INVALID,
  ADD_RESOURCE_VALID,
  GEAR_OUTLINE,
  TILE_OUTLINE,
} from './color.js'
import { updateProjection, updateView } from './matrices.js'
import { renderBuild } from './render-build.js'
import { renderChain } from './render-chain.js'
import { renderGears } from './render-gears.js'
import { renderGrid } from './render-grid.js'
import {
  renderGearOutline,
  renderTileOutline,
} from './render-outline.js'
import { renderResources } from './render-resources.js'
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
  renderResources(state, gl, gpu)
  renderGears(state, gl, gpu)

  for (const { gear1, gear2, type } of iterateConnections(
    state.world.gears,
  )) {
    if (type === ConnectionType.enum.Chain) {
      renderChain(gear1, gear2, gl, gpu, state.camera.zoom)
    }
  }

  const { hand } = state
  switch (hand?.type) {
    case HandType.Build: {
      renderBuild(state, gl, gpu, hand)
      break
    }
    case HandType.ApplyForce:
    case HandType.ApplyFriction:
    case HandType.Configure: {
      if (hand.gear) {
        renderGearOutline(
          state,
          gl,
          gpu,
          hand.gear,
          GEAR_OUTLINE,
        )
      } else {
        renderTileOutline(state, gl, gpu, TILE_OUTLINE)
      }
      break
    }
    case HandType.AddResource: {
      const color = hand.valid
        ? ADD_RESOURCE_VALID
        : ADD_RESOURCE_INVALID
      renderTileOutline(state, gl, gpu, color)
      break
    }
  }
}
