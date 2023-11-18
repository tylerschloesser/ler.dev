import invariant from 'tiny-invariant'
import {
  updateAccelerate,
  updateAcceleratePosition,
} from './accelerate.js'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import { TILE_SIZE } from './const.js'
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
  e: PointerEvent,
  state: AppState,
): void {
  const { canvas, pointer } = state
  const x = (e.offsetX - canvas.width / 2) / TILE_SIZE
  const y = (e.offsetY - canvas.height / 2) / TILE_SIZE
  pointer.position.x = x
  pointer.position.y = y
}

function handlePointer(
  e: PointerEvent,
  state: AppState,
): void {
  const { pointer } = state
  updatePosition(e, state)
  switch (e.type) {
    case 'pointerenter': {
      pointer.active = true
      break
    }
    case 'pointerup': {
      pointer.down = false
      switch (pointer.mode) {
        case PointerMode.Build: {
          executeBuild(state)
          break
        }
        case PointerMode.Accelerate: {
          updateAccelerate(state)
          break
        }
      }
      break
    }
    case 'pointerdown': {
      pointer.down = true
      switch (pointer.mode) {
        case PointerMode.Accelerate: {
          updateAccelerate(state)
          break
        }
      }
      break
    }
    case 'pointermove': {
      let tileX = Math.floor(pointer.position.x + 0.5)
      let tileY = Math.floor(pointer.position.y + 0.5)
      switch (pointer.mode) {
        case PointerMode.Build: {
          updateBuildPosition(state, tileX, tileY)
          break
        }
        case PointerMode.Accelerate: {
          updateAcceleratePosition(state, tileX, tileY)
          break
        }
      }
      break
    }
    case 'pointerleave': {
      pointer.active = false
      break
    }
    default: {
      invariant(false)
    }
  }
}
