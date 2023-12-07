import invariant from 'tiny-invariant'
import {
  ConnectionType,
  HandType,
  IAppContext,
} from '../types.js'
import { iterateConnections } from '../util.js'
import {
  ADD_RESOURCE_INVALID,
  ADD_RESOURCE_VALID,
  DELETE,
  GEAR_OUTLINE,
  TILE_OUTLINE,
} from './color.js'
import { updateProjection, updateView } from './matrices.js'
import { renderBeltHand } from './render-belt-hand.js'
import { renderBelt } from './render-belt.js'
import { renderBuild } from './render-build.js'
import { renderChain } from './render-chain.js'
import { renderGears } from './render-gears.js'
import { renderGrid } from './render-grid.js'
import {
  renderGearOutline,
  renderOutline,
  renderTileOutline,
} from './render-outline.js'
import { renderRect } from './render-rect.js'
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

  for (const belt of Object.values(context.world.belts)) {
    renderBelt(context, gl, gpu, belt)
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
        renderTileOutline(
          context,
          gl,
          gpu,
          TILE_OUTLINE,
          Math.floor(context.camera.position.x),
          Math.floor(context.camera.position.y),
        )
      }
      break
    }
    case HandType.AddResource: {
      const color = hand.valid
        ? ADD_RESOURCE_VALID
        : ADD_RESOURCE_INVALID
      renderTileOutline(
        context,
        gl,
        gpu,
        color,
        Math.floor(context.camera.position.x),
        Math.floor(context.camera.position.y),
      )
      break
    }
    case HandType.AddBelt: {
      renderBeltHand(context, gl, gpu, hand)
      break
    }
    case HandType.Delete: {
      const lineWidth =
        0.1 + (1 - context.camera.zoom) * 0.2
      renderOutline(
        gl,
        gpu,
        TILE_OUTLINE,
        hand.position.x,
        hand.position.y,
        hand.size,
        hand.size,
        lineWidth,
      )

      for (const gearId of hand.gearIds) {
        const gear = context.world.gears[gearId]
        invariant(gear)
        renderRect(
          gl,
          gpu,
          gear.center.x - gear.radius,
          gear.center.y - gear.radius,
          gear.radius * 2,
          gear.radius * 2,
          DELETE,
        )
      }
      for (const tileId of hand.tileIds) {
        const [x, y] = tileId
          .split('.')
          .map((v) => parseInt(v))
        invariant(typeof x === 'number')
        invariant(typeof y === 'number')
        renderRect(gl, gpu, x, y, 1, 1, DELETE)
      }
    }
  }
}
