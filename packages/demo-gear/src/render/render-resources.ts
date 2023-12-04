import invariant from 'tiny-invariant'
import { IAppContext } from '../types.js'
import { FUEL_COLOR } from './color.js'
import { renderRect } from './render-rect.js'
import { GpuState } from './types.js'

export function renderResources(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  for (const [tileId, tile] of Object.entries(
    context.world.tiles,
  )) {
    if (!tile.resourceType) {
      continue
    }
    const position = tileId
      .split('.')
      .map((v) => parseInt(v))
    const [x, y] = position
    invariant(typeof x === 'number')
    invariant(typeof y === 'number')

    renderRect(gl, gpu, x, y, 1, 1, FUEL_COLOR)
  }
}
