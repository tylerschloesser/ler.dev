import invariant from 'tiny-invariant'
import { tempGetGear } from '../temp.js'
import {
  IAppContext,
  BuildHand,
  EntityType,
  ConnectionType,
} from '../types.js'
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
        if (chainId) {
          const chain = context.world.entities[chainId]
          invariant(chain?.type === EntityType.enum.Gear)

          renderChain(
            entity,
            chain,
            gl,
            gpu,
            context.camera.zoom,
          )
        }

        break
      }
      default: {
        invariant(false, 'TODO')
      }
    }
  }
}
