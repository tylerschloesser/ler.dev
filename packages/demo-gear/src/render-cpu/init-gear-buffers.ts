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
      teeth: initTeeth(gl, radius),
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

  const vertices = new Float32Array((teeth + 1) * 2 + 2)

  vertices[0] = 0.0
  vertices[1] = 0.0

  for (let i = 0; i <= teeth; i++) {
    const angle = TWO_PI * (i / teeth)
    vertices[2 + i * 2 + 0] = Math.cos(angle)
    vertices[2 + i * 2 + 1] = Math.sin(angle)
  }

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  return { vertex, count: vertices.length / 2 }
}

function initTeeth(
  gl: WebGL2RenderingContext,
  radius: number,
): GpuState['buffers']['gears'][0]['teeth'] {
  const teeth = radius * TEETH
  const size = 1 - 0.1 / radius

  const vertices = new Float32Array((teeth + 1) * 4)
  const masks = new Uint8Array((teeth + 1) * 4)

  for (let i = 0; i <= teeth; i++) {
    const angle = TWO_PI * (i / teeth)

    vertices[i * 4 + 0] = Math.cos(angle)
    vertices[i * 4 + 1] = Math.sin(angle)
    vertices[i * 4 + 2] = Math.cos(angle) * size
    vertices[i * 4 + 3] = Math.sin(angle) * size

    masks[i * 4 + 0] = i % 4 < 2 ? 1 : 0
    masks[i * 4 + 1] = i % 4 < 2 ? 1 : 0
    masks[i * 4 + 2] = i % 4 < 2 ? 1 : 0
    masks[i * 4 + 3] = i % 4 < 2 ? 1 : 0
  }

  const vertex = gl.createBuffer()
  invariant(vertex)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const mask = gl.createBuffer()
  invariant(mask)
  gl.bindBuffer(gl.ARRAY_BUFFER, mask)
  gl.bufferData(gl.ARRAY_BUFFER, masks, gl.STATIC_DRAW)

  return { vertex, count: vertices.length / 2, mask }
}
