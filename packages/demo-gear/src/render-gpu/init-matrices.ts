import { mat4 } from 'gl-matrix'
import { GpuState } from './types.js'

export function initMatrices(): GpuState['matrices'] {
  const model = mat4.create()
  const view = mat4.create()
  const projection = mat4.create()

  return { model, view, projection }
}
