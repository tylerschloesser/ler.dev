import {
  ConnectionType,
  HandType,
  IAppContext,
} from '../types.js'
import { iterateConnections } from '../util.js'
import {
  ADD_RESOURCE_INVALID,
  ADD_RESOURCE_VALID,
  GEAR_OUTLINE,
  TILE_OUTLINE,
} from './color.js'
import { updateProjection, updateView } from './matrices.js'
import { renderBeltHand } from './render-belt-hand.js'
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
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  updateView(gpu.matrices, context)
  updateProjection(gpu.matrices, context)

  renderGrid(context, gl, gpu)
  renderResources(context, gl, gpu)
  renderGears(context, gl, gpu)

  for (const { gear1, gear2, type } of iterateConnections(
    context.world.gears,
  )) {
    if (type === ConnectionType.enum.Chain) {
      renderChain(
        gear1,
        gear2,
        gl,
        gpu,
        context.camera.zoom,
      )
    }
  }

  const { hand } = context
  switch (hand?.type) {
    case HandType.Build: {
      renderBuild(context, gl, gpu, hand)
      break
    }
    case HandType.ApplyForce:
    case HandType.ApplyFriction:
    case HandType.Configure: {
      if (hand.gear) {
        renderGearOutline(
          context,
          gl,
          gpu,
          hand.gear,
          GEAR_OUTLINE,
        )
      } else {
        renderTileOutline(context, gl, gpu, TILE_OUTLINE)
      }
      break
    }
    case HandType.AddResource: {
      const color = hand.valid
        ? ADD_RESOURCE_VALID
        : ADD_RESOURCE_INVALID
      renderTileOutline(context, gl, gpu, color)
      break
    }
    case HandType.AddBelt: {
      renderBeltHand(context, gl, gpu, hand)
      break
    }
  }
}
