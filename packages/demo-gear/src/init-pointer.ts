import invariant from 'tiny-invariant'
import {
  updateAccelerate,
  updateAcceleratePosition,
} from './accelerate.js'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import { handlePointer as handlePointerFree } from './camera.js'
import { AppState, InitFn, PointerMode } from './types.js'

export const initPointer: InitFn = (state) => {
  const { canvas, signal } = state
  canvas.addEventListener(
    'pointerenter',
    (e) => handlePointer(e, state),
    { signal },
  )
  canvas.addEventListener(
    'pointermove',
    (e) => handlePointer(e, state),
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => handlePointer(e, state),
    { signal },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => handlePointer(e, state),
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    (e) => handlePointer(e, state),
    { signal },
  )
}

function updatePosition(
  state: AppState,
  e: PointerEvent,
): void {
  const { canvas, pointer, tileSize, camera } = state
  const vx = canvas.width
  const vy = canvas.height
  const x =
    (e.offsetX - vx / 2) / tileSize + camera.position.x
  const y =
    (e.offsetY - vy / 2) / tileSize + camera.position.y
  pointer.position.x = x
  pointer.position.y = y
}

function handlePointer(
  e: PointerEvent,
  state: AppState,
): void {
  if (state.pointer.mode === PointerMode.Free) {
    handlePointerFree(e, state)
    return
  }

  const { pointer } = state
  updatePosition(state, e)
  switch (e.type) {
    case 'pointerenter': {
      let tileX = Math.floor(pointer.position.x + 0.5)
      let tileY = Math.floor(pointer.position.y + 0.5)
      if (state.build) {
        updateBuildPosition(state, tileX, tileY)
      }
      if (state.accelerate) {
        updateAcceleratePosition(state, tileX, tileY)
      }
      break
    }
    case 'pointerup': {
      pointer.down = false
      if (state.build) {
        executeBuild(state)
      }
      if (state.accelerate) {
        updateAccelerate(state)
      }
      break
    }
    case 'pointerdown': {
      pointer.down = true
      if (state.accelerate) {
        updateAccelerate(state)
      }
      break
    }
    case 'pointermove': {
      let tileX = Math.floor(pointer.position.x + 0.5)
      let tileY = Math.floor(pointer.position.y + 0.5)
      if (state.build) {
        updateBuildPosition(state, tileX, tileY)
      }
      if (state.accelerate) {
        updateAcceleratePosition(state, tileX, tileY)
      }
      break
    }
    case 'pointerleave': {
      if (state.build) {
        state.build.position = null
      }
      if (state.accelerate) {
        state.accelerate.position = null
      }
      break
    }
    default: {
      invariant(false)
    }
  }
}
