import invariant from 'tiny-invariant'
import { moveCamera } from './camera.js'
import { moveHand } from './hand.js'
import { AppState, PointerMode } from './types.js'

export function updatePointerMode(
  state: AppState,
  mode: PointerMode,
): void {
  if (state.pointerMode === mode) {
    return
  }
  state.pointerMode

  switch (mode) {
    case PointerMode.Free: {
      state.pointerListeners.add(moveCamera)
      state.pointerListeners.delete(moveHand)
      break
    }
    case PointerMode.Hand: {
      state.pointerListeners.add(moveHand)
      state.pointerListeners.delete(moveCamera)
      break
    }
    default: {
      invariant(false)
    }
  }
}
