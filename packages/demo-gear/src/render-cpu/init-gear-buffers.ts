import invariant from 'tiny-invariant'
import { GEAR_RADIUSES, TEETH, TWO_PI } from '../const.js'
import { GpuState } from '../render-gpu/types.js'

export function initGearBuffers(
  gl: WebGL2RenderingContext,
): GpuState['buffers']['gears'] {
  const gears: GpuState['buffers']['gears'] = {}

  for (const radius of GEAR_RADIUSES) {
    gears[radius] = {
      circle: initCircle(gl, radius),
    }
  }

  return gears
}

function initCircle(
  gl: WebGL2RenderingContext,
  radius: number,
): GpuState['buffers']['gears'][0]['circle'] {
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

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  return { vertex, count: data.length / 2 }
}
