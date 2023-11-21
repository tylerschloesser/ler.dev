import invariant from 'tiny-invariant'
import { GEAR_RADIUSES, TEETH, TWO_PI } from '../const.js'
import { GpuState } from '../render-gpu/types.js'

export function initGearBuffers(
  gl: WebGL2RenderingContext,
): GpuState['buffers']['gears'] {
  const gears: GpuState['buffers']['gears'] = {}

  for (const radius of GEAR_RADIUSES) {
    const vertex = gl.createBuffer()
    invariant(vertex)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex)

    const teeth = radius * TEETH

    const data = new Float32Array((teeth + 1) * 2 + 2)

    data[0] = 0.0
    data[1] = 0.0

    for (let i = 0; i <= teeth; i++) {
      const angle = TWO_PI * (i / teeth)
      data[2 + i * 2 + 0] = Math.cos(angle)
      data[2 + i * 2 + 1] = Math.sin(angle)
    }

    // TODO
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    gears[radius] = {
      circle: { vertex, count: data.length / 2 },
    }
  }

  return gears
}
