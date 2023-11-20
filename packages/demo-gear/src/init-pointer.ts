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
import {
  AppState,
  HandType,
  InitFn,
  PointerMode,
} from './types.js'

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

  const { pointer, hand } = state
  updatePosition(state, e)
  switch (e.type) {
    case 'pointerenter': {
      let tileX = Math.floor(pointer.position.x + 0.5)
      let tileY = Math.floor(pointer.position.y + 0.5)
      switch (hand?.type) {
        case HandType.Build: {
          updateBuildPosition(state, hand, tileX, tileY)
          break
        }
        case HandType.Accelerate: {
          updateAcceleratePosition(
            state,
            hand,
            tileX,
            tileY,
          )
          break
        }
      }
      break
    }
    case 'pointerup': {
      pointer.down = false
      switch (hand?.type) {
        case HandType.Build: {
          executeBuild(state, hand)
          break
        }
        case HandType.Accelerate: {
          updateAccelerate(state, hand)
          break
        }
      }
      break
    }
    case 'pointerdown': {
      pointer.down = true
      switch (hand?.type) {
        case HandType.Accelerate: {
          updateAccelerate(state, hand)
          break
        }
      }
      break
    }
    case 'pointermove': {
      let tileX = Math.floor(pointer.position.x + 0.5)
      let tileY = Math.floor(pointer.position.y + 0.5)
      switch (hand?.type) {
        case HandType.Build: {
          updateBuildPosition(state, hand, tileX, tileY)
          break
        }
        case HandType.Accelerate: {
          updateAcceleratePosition(
            state,
            hand,
            tileX,
            tileY,
          )
          break
        }
      }
      break
    }
    case 'pointerleave': {
      if (hand) {
        hand.position = null
      }
      break
    }
    default: {
      invariant(false)
    }
  }
}
