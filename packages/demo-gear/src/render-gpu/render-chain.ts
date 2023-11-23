import invariant from 'tiny-invariant'
import { PI, TEETH, TWO_PI } from '../const.js'
import { Gear } from '../types.js'
import { dist } from '../util.js'
import {
  updateChainArcModel,
  updateChainStraightModel,
} from './matrices.js'
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

  gl.uniform4f(chain.uniforms.color, 1.0, 1.0, 1.0, 1.0)

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
  invariant(n % 2 === 0)

  const s2 = (2 * d) / n - s1

  invariant(s2 >= s1)

  const chainAngle = Math.atan2(
    gear2.position.y - gear1.position.y,
    gear2.position.x - gear1.position.x,
  )

  const theta = TWO_PI / teeth
  const theta2 = theta * 2
  const progress =
    ((gear1.angle + theta / 2 + TWO_PI) % theta2) / theta2

  for (let i = 0; i < teeth / 2; i++) {
    const toothAngle = i * 2 * TWO_PI * (1 / teeth)

    const angle =
      (chainAngle + toothAngle + gear1.angle) % TWO_PI

    //
    // arcs
    //
    if (
      (toothAngle + gear1.angle + theta / 2 + TWO_PI) %
        TWO_PI >=
      PI
    ) {
      updateChainArcModel(
        gpu.matrices,
        gear1,
        zoom,
        angle,
        s1,
      )
      gl.uniformMatrix4fv(
        chain.uniforms.model,
        false,
        gpu.matrices.model,
      )
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    if (
      (toothAngle + gear1.angle + theta / 2 + TWO_PI) %
        TWO_PI <=
      PI
    ) {
      updateChainArcModel(
        gpu.matrices,
        gear2,
        zoom,
        angle,
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

  gl.uniform4f(chain.uniforms.color, 1.0, 1.0, 1.0, 1.0)
  {
    for (let i = 0; i < n / 2; i++) {
      updateChainStraightModel(
        gpu.matrices,
        gear1,
        zoom,
        chainAngle,
        s1,
        (s1 + s2) * (i + progress),
      )
      gl.uniformMatrix4fv(
        chain.uniforms.model,
        false,
        gpu.matrices.model,
      )
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      updateChainStraightModel(
        gpu.matrices,
        gear2,
        zoom,
        chainAngle + PI,
        s1,
        (s1 + s2) * (i + progress),
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
