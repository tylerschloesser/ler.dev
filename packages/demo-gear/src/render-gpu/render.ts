import {
  AppState,
  ConnectionType,
  HandType,
} from '../types.js'
import { iterateConnections } from '../util.js'
import { updateProjection, updateView } from './matrices.js'
import { renderChain } from './render-chain.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'
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

  for (const { gear1, gear2, type } of iterateConnections(
    state.world.gears,
  )) {
    if (type === ConnectionType.enum.Chain) {
      renderChain(gear1, gear2, gl, gpu, state.camera.zoom)
    }
  }

  switch (state.hand?.type) {
    case HandType.Build: {
    }
  }
}

function renderGears(
  state: AppState,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
) {
  const { view, projection } = gpu.matrices
  const { gearBody, gearTeeth } = gpu.programs

  gl.useProgram(gearBody.program)
  gl.uniformMatrix4fv(gearBody.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    gearBody.uniforms.projection,
    false,
    projection,
  )

  gl.useProgram(gearTeeth.program)
  gl.uniformMatrix4fv(gearTeeth.uniforms.view, false, view)
  gl.uniformMatrix4fv(
    gearTeeth.uniforms.projection,
    false,
    projection,
  )
  gl.uniform1f(gearTeeth.uniforms.tileSize, state.tileSize)

  for (const gear of Object.values(state.world.gears)) {
    renderGear(gear, gl, gpu, state.camera.zoom)
  }
}
