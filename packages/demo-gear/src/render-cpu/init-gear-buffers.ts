import invariant from 'tiny-invariant'
import { GEAR_RADIUSES } from '../const.js'
import { GpuState } from '../render-gpu/types.js'

export function initGearBuffers(
  gl: WebGL2RenderingContext,
): GpuState['buffers']['gears'] {
  const gears: GpuState['buffers']['gears'] = {}

  for (const radius of GEAR_RADIUSES) {
    const vertex = gl.createBuffer()
    invariant(vertex)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex)

    gears[radius] = { vertex }
  }

  return gears
}
