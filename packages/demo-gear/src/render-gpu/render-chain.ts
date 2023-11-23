import invariant from 'tiny-invariant'
import { TEETH, TWO_PI } from '../const.js'
import { Gear } from '../types.js'
import { dist } from '../util.js'
import { updateChainArcModel } from './matrices.js'
import { GpuState } from './types.js'

export function renderChain(
  gear1: Gear,
  gear2: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  zoom: number,
): void {
  const { chain } = gpu.programs
  gl.useProgram(chain.program)

  const { view, projection } = gpu.matrices

  gl.uniformMatrix4fv(chain.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    chain.uniforms.projection,
    false,
    projection,
  )

  gl.uniform4f(chain.uniforms.color, 1.0, 0.0, 0.0, 1.0)

  const buffer = gpu.buffers.square
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(
    chain.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(chain.attributes.vertex)

  invariant(gear1.radius === gear2.radius)
  invariant(gear1.angle === gear2.angle)

  const teeth = gear1.radius * TEETH
  invariant(teeth % 2 === 0)

  const s1 =
    2 *
    (gear1.radius * Math.sin((TWO_PI * (1 / teeth)) / 2))

  const d = dist(
    gear1.position.x,
    gear1.position.y,
    gear2.position.x,
    gear2.position.y,
  )

  const n = Math.floor(d / (2 * s1)) * 2
  const s2 = (2 * d) / n - s1

  //
  // gear1
  //
  {
    for (let i = 0; i < teeth / 2; i++) {
      const angle = i * 2 * TWO_PI * (1 / teeth)

      updateChainArcModel(
        gpu.matrices,
        gear1,
        zoom,
        angle + gear1.angle,
        s1,
      )
      gl.uniformMatrix4fv(
        chain.uniforms.model,
        false,
        gpu.matrices.model,
      )
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }

  //
  // gear2
  //
  {
    for (let i = 0; i < teeth / 2; i++) {
      const angle = i * 2 * TWO_PI * (1 / teeth)

      updateChainArcModel(
        gpu.matrices,
        gear2,
        zoom,
        angle + gear2.angle,
        s1,
      )
      gl.uniformMatrix4fv(
        chain.uniforms.model,
        false,
        gpu.matrices.model,
      )
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }
}
