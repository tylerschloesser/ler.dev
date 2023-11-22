import { AppState } from '../types.js'
import { updateProjection, updateView } from './matrices.js'
import { renderGear } from './render-gear.js'
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
  const { gearBody } = gpu.programs
  gl.useProgram(gearBody.program)

  const { view, projection } = gpu.matrices
  gl.uniformMatrix4fv(gearBody.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    gearBody.uniforms.projection,
    false,
    projection,
  )

  for (const gear of Object.values(state.world.gears)) {
    renderGear(gear, gl, gpu)
  }
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
