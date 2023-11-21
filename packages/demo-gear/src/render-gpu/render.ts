import invariant from 'tiny-invariant'
import { AppState, Gear } from '../types.js'
import {
  updateModel,
  updateProjection,
  updateView,
} from './matrices.js'
import { GpuState } from './types.js'

export function render(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  updateView(gpu.matrices, state)
  updateProjection(gpu.matrices, state)

  renderGrid(state, gl, gpu)
  renderGears(state, gl, gpu)
}

function renderGears(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  const { main } = gpu.programs
  gl.useProgram(main.program)

  gl.uniform4f(main.uniforms.color, 0.0, 1.0, 0.0, 1.0)

  const { view, projection } = gpu.matrices
  gl.uniformMatrix4fv(main.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    main.uniforms.projection,
    false,
    projection,
  )

  for (const gear of Object.values(state.world.gears)) {
    renderGear(gear, gl, gpu)
  }
}

function renderGear(
  gear: Gear,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { main } = gpu.programs

  const buffer = gpu.buffers.gears[gear.radius]
  invariant(buffer)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.circle.vertex)
  gl.vertexAttribPointer(
    main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(main.attributes.vertex)

  updateModel(gpu.matrices, gear)

  const { model } = gpu.matrices
  gl.uniformMatrix4fv(main.uniforms.model, false, model)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.circle.count)
}

function renderGrid(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
): void {
  const { grid } = gpu.programs

  gl.useProgram(grid.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffers.square)
  gl.vertexAttribPointer(
    grid.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  gl.enableVertexAttribArray(grid.attributes.vertex)

  const { pixelRatio } = state.viewport
  gl.uniform2f(
    grid.uniforms.viewport,
    state.viewport.size.x * pixelRatio,
    state.viewport.size.y * pixelRatio,
  )

  gl.uniform1f(
    grid.uniforms.tileSize,
    state.tileSize * pixelRatio,
  )

  gl.uniform2f(
    grid.uniforms.camera,
    state.camera.position.x,
    state.camera.position.y,
  )

  gl.uniform1f(grid.uniforms.pixelRatio, pixelRatio)
  gl.uniform1f(grid.uniforms.zoom, state.camera.zoom)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
