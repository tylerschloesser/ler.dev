import invariant from 'tiny-invariant'
import {
  updateAccelerate,
  updateAcceleratePosition,
} from './accelerate.js'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import {
  AppState,
  HandType,
  PointerListenerFn,
  SimpleVec2,
} from './types.js'

const pointerPosition: SimpleVec2 = {
  x: 0,
  y: 0,
}

export const moveHand: PointerListenerFn = (state, e) => {
  const { hand } = state
  updatePointerPosition(state, e)
  switch (e.type) {
    case 'pointerenter': {
      const tileX = Math.floor(pointerPosition.x + 0.5)
      const tileY = Math.floor(pointerPosition.y + 0.5)
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
      switch (hand?.type) {
        case HandType.Build: {
          executeBuild(state, hand)
          break
        }
        case HandType.Accelerate: {
          updateAccelerate(state, hand, false)
          break
        }
      }
      break
    }
    case 'pointerdown': {
      switch (hand?.type) {
        case HandType.Accelerate: {
          updateAccelerate(state, hand, true)
          break
        }
      }
      break
    }
    case 'pointermove': {
      const tileX = Math.floor(pointerPosition.x + 0.5)
      const tileY = Math.floor(pointerPosition.y + 0.5)
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

function updatePointerPosition(
  state: AppState,
  e: PointerEvent,
): void {
  const { canvas, tileSize, camera } = state
  const vx = canvas.width
  const vy = canvas.height
  const x =
    (e.offsetX - vx / 2) / tileSize + camera.position.x
  const y =
    (e.offsetY - vy / 2) / tileSize + camera.position.y
  pointerPosition.x = x
  pointerPosition.y = y
}
