import invariant from 'tiny-invariant'
import {
  BuildHand,
  ConnectionType,
  EntityType,
  IAppContext,
} from '../types.js'
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

        const chainId = entity.connections.find(
          (c) => c.type === ConnectionType.enum.Chain,
        )?.entityId

        if (build.valid && chainId) {
          const chain = context.world.entities[chainId]
          invariant(chain?.type === EntityType.enum.Gear)

          renderChain(
            entity,
            chain,
            gl,
            gpu,
            context.camera.zoom,
            false,
          )
        }

        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
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
}
