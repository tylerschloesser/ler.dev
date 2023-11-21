import { AppState, Gear } from '../types.js'
import { GpuState } from './types.js'

export function render(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  renderGrid(state, gl, gpu)

  for (const gear of Object.values(state.world.gears)) {
    renderGear(state, gl, gpu, gear)
  }
}

function renderGear(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  gear: Gear,
): void {}

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
