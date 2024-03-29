import invariant from 'tiny-invariant'
import {
  BuildHand,
  ConnectionType,
  EntityType,
  IAppContext,
} from '../types.js'
import { iterateConnections } from '../util.js'
import {
  ADD_BELT_INVALID,
  ADD_BELT_VALID,
  BUILD_GEAR_INVALID,
  BUILD_GEAR_VALID,
} from './color.js'
import { renderBelt } from './render-belt.js'
import { renderChain } from './render-chain.js'
import { renderGear } from './render-gears.js'
import { GpuState } from './types.js'

export function renderBuild(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  build: BuildHand,
) {
  for (const entity of Object.values(build.entities)) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        renderGear(
          entity,
          gl,
          gpu,
          context.camera.zoom,
          build.valid
            ? BUILD_GEAR_VALID
            : BUILD_GEAR_INVALID,
        )
        break
      }
      case EntityType.enum.Belt: {
        const color = build.valid
          ? ADD_BELT_VALID
          : ADD_BELT_INVALID
        renderBelt(context, gl, gpu, entity, color)
        break
      }
      default: {
        invariant(false, 'TODO')
      }
    }
  }

  if (build.valid) {
    for (const {
      entity1,
      entity2,
      type,
    } of iterateConnections(build.entities, false)) {
      if (type === ConnectionType.enum.Chain) {
        invariant(entity1.type === EntityType.enum.Gear)
        invariant(entity2.type === EntityType.enum.Gear)
        renderChain(
          entity1,
          entity2,
          gl,
          gpu,
          context.camera.zoom,
          false,
        )
      }
    }
  }
}
